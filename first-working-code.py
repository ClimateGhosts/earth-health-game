from copy import deepcopy

# <METADATA>
SOLUZION_VERSION = "4.0"
PROBLEM_NAME = "Earth Health"
PROBLEM_VERSION = "1.0"
PROBLEM_AUTHORS = ["Alicia Stepin", "Andrey Risukhin", "James Gale", "Maxim Kuznetsov"]
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


MAX_REGION_HEALTH = 5
INITIAL_REGION_HEALTH = 3
STARTING_MONEY = 100

PLAYERS = 4


class RegionState:
    """
    Class within state storing the data for one region
    """

    def __init__(self, name: str, current_player: int):
        self.name = name
        self.current_player = current_player
        self.health = INITIAL_REGION_HEALTH

    def __str__(self):
        return f"Region {self.name} has {self.health} health"

    def __eq__(self, other):
        return self.__dict__ == other.__dict__


class PlayerState:

    def __init__(self, player_id=0):
        self.player_id = player_id
        self.money = STARTING_MONEY

    def __str__(self):
        return f"Player {self.player_id} has {self.money} money"

    def __eq__(self, other):
        return self.__dict__ == other.__dict__


class State:
    """
    State for our initial game
    """

    def __init__(self):
        self.time = 0
        self.current_player = 0
        self.players = [PlayerState(player_id) for player_id in range(PLAYERS)]
        self.regions = {
            "Jamestown": RegionState("Jamestown", 0),
            "Alicialand": RegionState("Alicialand", 1),
            "Maxopolis": RegionState("Maxopolis", 2),
            "Andreyville": RegionState("Andreyville", 3),
        }

    def __eq__(self, other):
        return self.__dict__ == other.__dict__

    def __str__(self):
        result = ""

        return result

    def clone(self):
        return deepcopy(self)

    def is_goal(self):
        return False

    def goal_message(self):
        return "TODO goal message"


class UpOperator(Basic_Operator):
    def __init__(self):
        super().__init__("Be selfish")

    def is_applicable(self, state):
        return True

    def apply(self, state):
        new_state: State = state.clone()

        return new_state


class DownOperator(Basic_Operator):
    def __init__(self):
        super().__init__("Don't be selfish")

    def is_applicable(self, state):
        return True

    def apply(self, state):
        new_state: State = state.clone()

        player = state.current_player

        return new_state


# </COMMON_CODE>

# <OPERATORS>
OPERATORS = [UpOperator(), DownOperator()]

# </OPERATORS>
