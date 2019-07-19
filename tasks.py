import json
import io
import sqlite3
import os
import csv
from invoke import task
from contextlib import closing


MOST_RECENT_YEAR = 2018


@task
def clean(ctx):
    ctx.run('rm -f sunshine.db')


def _parse_money(s):
    return s.replace('$', '').replace(',', '').strip()


CLEANER = {
    'Sector': unicode.strip,
    'Last Name': unicode.strip,
    'First Name': unicode.strip,
    'Calendar Year': int,
    'Job Title': unicode.strip,
    'Employer': unicode.strip,
    'Salary Paid': _parse_money,
    'Taxable Benefits': _parse_money,
}


def  _clean(entry, year):
    # Lots of data quality issues in the original data set
    # This function cleans up some of these known problems
    if 'sector' in entry or '_sector' in entry:
        # Entry is not in the standard format.  Convert it to the acceptable format
        for key in CLEANER:
            new_key = key.lower().replace(' ', '_')
            if new_key not in entry:
                if new_key == 'sector':
                    entry[key] = entry['_sector']['content']  # Stupid
            else:
                entry[key] = entry[new_key]['content']

    cleaned = dict(entry)
    for key, cleaner in CLEANER.items():
        try:
            cleaned[key] = cleaner(cleaned[key])
        except:
            if key == 'Calendar Year':
                cleaned[key] = year
            else:
                raise
    return cleaned


def _process_entry(cursor, entry, year):
    cursor.execute("""
INSERT INTO sunshine
(sector, last_name, first_name, salary, taxable_benefits, employer, title, calendar_year)
VALUES
(?,?,?,?,?,?,?,?);""", [entry[i] for i in ['Sector', 'Last Name', 'First Name', 'Salary Paid', 'Taxable Benefits', 'Employer', 'Job Title', 'Calendar Year']])


def _process_data_file(cursor, data_file, year):
    print('Processing {}'.format(data_file))
    with io.open(data_file, 'r', encoding='utf8') as f:
        entries = json.load(f)
        for entry in entries:
            try:
                _process_entry(cursor, _clean(entry, year=year), year=year)
            except Exception as e:
                print(e)
                print('Skip unclean entry: {}'.format(entry))


@task(pre=[clean])
def init_db(ctx):
    ctx.run('sqlite3 sunshine.db < db/schema.sql')

    with closing(sqlite3.connect('sunshine.db')) as conn:
        cursor = conn.cursor()
        for data_file in os.listdir('raw_data'):
            if not data_file.endswith('.json'):
                continue
            year = data_file.split('.')[0]
            _process_data_file(cursor, 'raw_data/{}'.format(data_file), year=year)
        conn.commit()


@task
def overview(ctx):
    with closing(sqlite3.connect('sunshine.db')) as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT count(*) FROM sunshine WHERE calendar_year=?', [MOST_RECENT_YEAR])
        num_sunshine, = cursor.fetchone()
        print('num_sunshine={}'.format(num_sunshine))

        cursor.execute('SELECT sum(salary) FROM sunshine WHERE calendar_year=?', [MOST_RECENT_YEAR])
        total_amount, = cursor.fetchone()
        print('total_amount={}'.format(total_amount))

        cursor.execute(
            'SELECT sector, count(*), SUM(salary)/count(*) AS avg_salary FROM sunshine WHERE calendar_year=? GROUP BY sector ORDER BY avg_salary DESC LIMIT 1;',
            [MOST_RECENT_YEAR]
        )
        sector, count, avg_salary = cursor.fetchone()
        print(sector, count, avg_salary)

        cursor.execute('SELECT sum(salary) FROM sunshine WHERE calendar_year=?', [MOST_RECENT_YEAR - 1])
        total_amount_last_year, = cursor.fetchone()
        print(total_amount_last_year)
        yoy_increase = 100. * (total_amount - total_amount_last_year) / total_amount
        print('yoy_increase={}%'.format(yoy_increase))