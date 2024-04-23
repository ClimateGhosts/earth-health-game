from copy import deepcopy

# <METADATA>
SOLUZION_VERSION = "4.0"
PROBLEM_NAME = "Earth Health"
PROBLEM_VERSION = "1.0"
PROBLEM_AUTHORS = ["Alicia Stepin", "Andre Risukhin", "James Gale", "Maxim Kuznetsov"]
PROBLEM_CREATION_DATE = "23-APRIL-2024"

# The following field is mainly for the human solver, via either the Text_SOLUZION_Client.
# or the SVG graphics client.
PROBLEM_DESC = """
    Climate change disasters are not independent, but are cumulative and compounding. 
    They lead to changing migration and settlement patterns for animals, people, 
    and therefore educators, charities, and organizations. 
    """

# </METADATA>

# <COMMON_CODE>

from libs.soluzion import Basic_Operator


class Color:
    """
    Console text color codes
    """

    RED = "\033[91m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    BLUE = "\033[94m"
    MAGENTA = "\033[95m"
    CYAN = "\033[96m"
    WHITE = "\033[97m"
    RESET = "\033[0m"


class State:
    """
    State for our initial game
    """

    def __init__(self):
        pass

    def __eq__(self, other):
        return self.__dict__ == other.__dict__

    def __str__(self):
        return "TODO state string"

    def clone(self):
        return deepcopy(self)

    def is_goal(self):
        return False

    def goal_message(self):
        return "TODO goal message"


class Operator(Basic_Operator):
    def __init__(self, name):
        super().__init__(name)

    def is_applicable(self, state):
        return True

    def apply(self, state):
        new_state: State = state.clone()

        return new_state


# </COMMON_CODE>

# <OPERATORS>
OPERATORS = []

OPERATORS.append(Operator("First Operator"))

# </OPERATORS>
