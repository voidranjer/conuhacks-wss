import json
from datetime import datetime

json_file = 'input.json'


def parse_ts(str):
    return datetime.strptime(str[:-3], "%Y-%m-%d %H:%M:%S.%f")


with open(json_file) as f:
    data = json.load(f)
    first_timestamp = parse_ts(data[0]['TimeStamp'])
    for index, item in enumerate(data):
        item['RelativeMillis'] = ((parse_ts(
            item['TimeStamp']) - first_timestamp).total_seconds()) * 1000

with open('output.json', 'w') as f:
    json.dump(data, f, indent=2)
