from flask import Flask, render_template
import json

from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
import ast
import pandas as pd

import utils
from team_stats import TeamStats
from utils import get_data_as_json, get_pca_columns, scale_numeric_values

app = Flask(__name__)

# ensure that we can reload when we change the HTML / JS for debugging
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.config['TEMPLATES_AUTO_RELOAD'] = True
DATA_FOLDER = 'static/data/'


@app.route('/')
def data():
    # 1. Get data from the csv files and pass them to the client
    player_data = get_data_as_json(DATA_FOLDER, "df_agg_player.csv").head(n=40)

    team_data = get_data_as_json(DATA_FOLDER, "df_agg_team.csv")
    cleaned_player_data = get_data_as_json(DATA_FOLDER, "cleaned_df_player_stats.csv").drop(
        columns=['Unnamed: 0', 'level_0'])

    cleaned_player_data_dict = utils.get_cleaned_player_data_by_season_and_team(cleaned_player_data,team_data.columns)

    # 2.Scale data and calculate PCA
    scaled_team_data = scale_numeric_values(team_data)
    scaled_pca_team = PCA(n_components=2).fit_transform(scaled_team_data)

    # the list format was weird , so I had to transform it again
    scaled_pca_team_as_string = repr(scaled_pca_team).strip('array][')
    scaled_pca_team_2d = ast.literal_eval(scaled_pca_team_as_string)

    # Create a list of objects for scatterplot data
    scatter_plot_data = []
    for i in range(len(scaled_pca_team_2d)):
        obj = {"id": int(team_data.loc[i, 'Team ID']),
               "name": team_data.loc[i, 'Team Name'],
               "x": scaled_pca_team_2d[i][0],
               "y": scaled_pca_team_2d[i][1]}
        scatter_plot_data.append(obj)

    # Creating an object from each row in the DataFrame, skipping rows where the team name is 'retired'
    team_stats_data = utils.get_team_stats_data(team_data)

    team_stats_dicts = [vars(obj) for obj in team_stats_data]
    column_mapping = json.dumps(utils.get_colum_mapping())

    # Convert the list of dictionaries to a JSON string
    team_stats_json = json.dumps(team_stats_dicts)

    #p

    # return the index file and the data
    return render_template("index.html", playerData=player_data, teamData=team_stats_json,
                           playerDataFor36=json.dumps(cleaned_player_data_dict), scatterPlotData=scatter_plot_data,
                           columnMapping=column_mapping)


if __name__ == '__main__':
    app.run()
