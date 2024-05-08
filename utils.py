import pandas as pd
from sklearn.preprocessing import StandardScaler

from team_stats import TeamStats


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


def get_team_stats_data(team_data):
    team_stats_data = []
    for index, row in team_data.iterrows():
        if row['Team Name'] != 'retired':
            team_stats = TeamStats(
                row['Team ID'], row['Team Name'], row['Number of Players'], row['Height'], row['Weight'],
                row['Number of Birth Places'], row['Total Games'], row['Total Minutes Played'],
                row['Field Goals'], row['Field Goals Attempted'], row['Field Goal %'], row['3pt'],
                row['3pt Attempted'], row['3pt %'], row['2pt'], row['2pt Attempted'], row['2pt %'],
                row['Free Throws'], row['Free Throws Attempted'], row['Free Throws %'],
                row['Offensive Rebounds'], row['Defensive Rebounds'], row['Total Rebounds'],
                row['Assists'], row['Steals'], row['Blocks'], row['Turnovers'], row['Personal Fouls'],
                row['Points']
            )
            team_stats_data.append(team_stats)

    return team_stats_data


def get_cleaned_player_data_dic(player_data):
    # Split 'season' column into two parts
    player_data[['start_year', 'end_year']] = player_data['season'].str.split('-', expand=True)

    # Convert start_year and end_year to integers
    player_data['start_year'] = player_data['start_year'].astype(int)
    player_data['end_year'] = player_data['end_year'].astype(int)

    # Filter the DataFrame for seasons greater than 2003
    filtered_df = player_data[player_data['start_year'] > 2003]

    # Revert the DataFrame back to original format
    filtered_df['season'] = filtered_df['start_year'].astype(str) + '-' + filtered_df['end_year'].astype(str)

    # Drop the intermediate columns
    filtered_cleaned_player_data = filtered_df.drop(columns=['start_year', 'end_year'])

    cleaned_player_data_dict = filtered_cleaned_player_data.to_dict(orient='records')
    return cleaned_player_data_dict


def build_team_aggregate_dictionary(teams_columns, player_data_columns):
    # creating a dictionary for use in the aggregate function of groupby
    # first is used when we don't want to aggregate but only get the first element
    # sum is used to get the sum of the rows
    agg_dictionary = {}
    cols = list(teams_columns) + list(player_data_columns)
    mean_column_list = ['fg', 'fga', 'fgp', 'fg3', 'fg3a', 'fg3p', 'fg2', 'fg2a', 'fg2p', 'ft', 'fta', 'ftp', 'orb',
                        'drb', 'trb', 'ast', 'stl', 'blk', 'tov', 'pf', 'pts', 'height', 'weight']

    for c in list(cols):
        if c == 'player_id':
            agg_dictionary[c] = 'count'
        elif c == 'total_games' or c == 'minutes_played':
            agg_dictionary[c] = 'sum'
        elif c in mean_column_list:
            agg_dictionary[c] = 'mean'

    # adding team_name at the end
    agg_dictionary['team_name'] = 'first'
    return agg_dictionary


def get_cleaned_player_data_by_season_and_team(cleaned_player_data, team_columns):
    team_agg_dictionary = build_team_aggregate_dictionary(team_columns, cleaned_player_data.columns)

    cleaned_data_grouped_by_season = cleaned_player_data.groupby(['season', 'team_name'], as_index=False).agg(
        team_agg_dictionary)
    return get_cleaned_player_data_dic(cleaned_data_grouped_by_season)
