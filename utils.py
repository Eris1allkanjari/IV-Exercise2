import pandas as pd
from sklearn.preprocessing import StandardScaler


def get_data_as_json(data_folder, file_name):
    return pd.read_csv(data_folder + file_name)


def get_pca_columns(all_team_columns):
    column_to_skip = ['Team ID', 'Team Name']
    pca_team_columns = []
    for c in list(all_team_columns):
        if c not in column_to_skip:
            pca_team_columns.append(c)

    return pca_team_columns


def scale_numeric_values(data):
    filtered_columns_data = data[get_pca_columns(data)]

    scaler = StandardScaler().set_output(transform='pandas')
    return scaler.fit_transform(filtered_columns_data)


def get_colum_mapping():
    return {
        'team_id': 'Team Id',
        'team_name': 'Team Name',
        'num_players': 'Num Players',
        'height': 'Height',
        'weight': 'Weight',
        'num_birth_places': 'Num Birth Places',
        'total_games': 'Total Games',
        'total_minutes_played': 'Total Minutes Played',
        'field_goals': 'Field Goals',
        'field_goals_attempted': 'Field Goals Attempted',
        'field_goal_percent': 'Field Goal Percent',
        'three_pointers': '3pt Pointers',
        'three_pointers_attempted': '3pt Attempted',
        'three_point_percent': '3pt % ',
        'two_pointers': '2pt',
        'two_pointers_attempted': '2pt Attempted',
        'two_point_percent': '2pt %',
        'free_throws': 'Free Throws',
        'free_throws_attempted': 'Free Throws Attempted',
        'free_throw_percent': 'Free Throw %',
        'offensive_rebounds': 'Offensive Rebounds',
        'defensive_rebounds': 'Defensive Rebounds',
        'total_rebounds': 'Total Rebounds',
        'assists': 'Assists',
        'steals': 'Steals',
        'blocks': 'Blocks',
        'turnovers': 'Turnovers',
        'personal_fouls': 'Personal Fouls',
        'points': 'Points'
    }
