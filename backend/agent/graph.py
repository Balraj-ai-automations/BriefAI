"""
LangGraph workflow definition for BriefAI.

This module defines:
- Graph nodes
- Execution flow
- Retry routing
- Compiled LangGraph application
"""

from langgraph.graph import StateGraph, END

from agent.state import BriefAIState

# -----------------------------
# Import LangGraph Nodes
# -----------------------------
from agent.nodes.input_parser import input_parser_node
from agent.nodes.strategy_planner import strategy_planner_node
from agent.nodes.copy_writer import copy_writer_node
from agent.nodes.image_prompt_builder import image_prompt_builder_node
from agent.nodes.quality_checker import quality_checker_node
from agent.nodes.response_compiler import response_compiler_node


def quality_router(state: BriefAIState) -> str:
    """
    Route execution after the Quality Checker.

    Returns:
        "retry" -> Retry copy generation.
        "pass"  -> Continue to the response compiler.
    """

    if (
        state.get("quality_passed") is False
        and state.get("retry_count", 0) < 2
    ):
        return "retry"

    return "pass"


# --------------------------------------------------
# Build Graph
# --------------------------------------------------

graph_builder = StateGraph(BriefAIState)


# --------------------------------------------------
# Register Nodes
# --------------------------------------------------

graph_builder.add_node(
    "input_parser",
    input_parser_node,
)

graph_builder.add_node(
    "strategy_planner",
    strategy_planner_node,
)

graph_builder.add_node(
    "copy_writer",
    copy_writer_node,
)

graph_builder.add_node(
    "image_prompt_builder",
    image_prompt_builder_node,
)

graph_builder.add_node(
    "quality_checker",
    quality_checker_node,
)

graph_builder.add_node(
    "response_compiler",
    response_compiler_node,
)


# --------------------------------------------------
# Entry Point
# --------------------------------------------------

graph_builder.set_entry_point("input_parser")


# --------------------------------------------------
# Main Workflow (Parallel Fan-out / Fan-in)
# --------------------------------------------------

# Input Parser -> Strategy Planner
graph_builder.add_edge(
    "input_parser",
    "strategy_planner",
)

# Strategy Planner fans out into two parallel branches
graph_builder.add_edge(
    "strategy_planner",
    "copy_writer",
)

graph_builder.add_edge(
    "strategy_planner",
    "image_prompt_builder",
)

# Fan-in
graph_builder.add_edge(
    "copy_writer",
    "quality_checker",
)

graph_builder.add_edge(
    "image_prompt_builder",
    "quality_checker",
)

# --------------------------------------------------
# Conditional Retry Logic
# --------------------------------------------------

graph_builder.add_conditional_edges(
    "quality_checker",
    quality_router,
    {
        "retry": "copy_writer",
        "pass": "response_compiler",
    },
)


# --------------------------------------------------
# Finish Workflow
# --------------------------------------------------

graph_builder.add_edge(
    "response_compiler",
    END,
)


# --------------------------------------------------
# Compile Graph
# --------------------------------------------------

graph = graph_builder.compile()