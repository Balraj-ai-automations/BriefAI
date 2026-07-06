from prompts.input_parser import build_input_parser_prompt

sample = {
    "product": "Handmade cotton kurtis",
    "price": "₹799",
    "buyer": "College girls",
}

prompt = build_input_parser_prompt(sample)

print(prompt)