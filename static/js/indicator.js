 let addSelectOptions = (columnMapping) => {
     for (let key in columnMapping) {
         let shouldCreateOption = key !== 'team_id' && key !== 'team_name' && key !== 'num_players' && key !== 'num_birth_places';
        if(shouldCreateOption) {
            let value = columnMapping[key];
            let option = document.createElement('option');
            option.value = key;
            option.textContent = value;
            document.getElementById('indicator_change').appendChild(option);
        }
    }
}

