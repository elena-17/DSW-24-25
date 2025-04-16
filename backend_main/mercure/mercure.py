import json

import jwt
import requests

from django.conf import settings


def publish_to_mercure(topic, data):
    jwt_token = jwt.encode({"mercure": {"publish": [topic]}}, settings.FIELD_ENCRYPTION_KEY, algorithm="HS256")
    response = requests.post(
        "http://localhost:3000/.well-known/mercure",
        data={"topic": topic, "data": json.dumps(data)},
        headers={"Authorization": f"Bearer {jwt_token}"},
    )
    return response.status_code
