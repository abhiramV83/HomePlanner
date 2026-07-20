import os

from openai import OpenAI


client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)


SYSTEM_PROMPT = """You are a luxury home architect. Generate a clear home plan in plain text. Keep it medium length (around 250–350 words). Include floor-wise layout, important room sizes, parking plan, and 6 luxury features. Avoid long explanations.
"""


def generate_response(prompt: str) -> str:

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {
                "role": "system",
                "content": SYSTEM_PROMPT
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.3
    )

    return response.choices[0].message.content