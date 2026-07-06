from agent.nodes.input_parser import input_parser_node

state = {
    "raw_input": {
        "product": "Handmade Cotton Kurtis",
        "price": "₹799",
        "buyer": "College Girls",
        "goal": "Increase Sales",
    },
    "business_profile": {},
    "error": None,
}

result = input_parser_node(state)

print(result["business_profile"])