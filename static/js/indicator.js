 let addSelectOptions = (columnMapping) => {
     for (let key in columnMapping) {
      let value = columnMapping[key];
      let option = document.createElement('option');
      option.value = key;
      option.textContent = value;
      document.getElementById('indicator_change').appendChild(option);
    }
}

