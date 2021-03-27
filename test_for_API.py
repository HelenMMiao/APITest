import requests

respone = requests.get('http://www.google.com')
print(respone.text)