from agent.nodes.strategy_planner import strategy_planner_node

state = {
    "business_profile": {
        "product": "Handmade Cotton Kurtis",
        "price": "₹799",
        "buyer_gender": "Female",
        "buyer_age": "18-30",
        "goal": "Increase Sales",
        "occasion": "Diwali",
        "business_type": "Clothing",
    },
    "strategy": {},
    "error": None,
}

result = strategy_planner_node(state)

print(result["strategy"])