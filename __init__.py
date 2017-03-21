import skygear
from skygear.pubsub import publish

@skygear.every('@every 5m')
def request_temperature():
    publish('request-temperature', {})

@skygear.after_save('temperature')
def check_temperature(record):
    if record['temperature'] > 70:
        publish('high-temperature', {
            'device':       record['created_by'],
            'temperature':  record['temperature']})

