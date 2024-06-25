const result = document.querySelector('.result');
const form = document.querySelector('.weather');
const nameCity = document.querySelector('#city');
const nameCountry = document.querySelector('#country');


form.addEventListener('submit', (e)=>{
    e.preventDefault();
    if(nameCity.value === '' || nameCountry.value === ''){
        showError('Ambos campos son obligatorios');
        return;
    }

    callAPI(nameCity.value, nameCountry.value);
})

const callAPI=(city, country)=>{
    
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city},${country}&appid=${apiId}`;
    const urlDaily =`https://api.openweathermap.org/data/2.5/forecast/daily?lat=${lat}&lon=${lon}&cnt=${cnt}&appid=${apiId}`
    const cnt = 7

    fetch(url)
        .then(response => response.json())
        .then(dataJSON =>{
            if(dataJSON.cod === '404'){
                showError('Ciudad no encontrada');
            }else{
                clearHTML();
                showWeather(dataJSON);
                console.log(dataJSON)
            }
        })
        .catch(error =>{
            console.log(error)
        })
    
    fetch(urlDaily)
        .then(data=>{
            return data.json()
        })
        .then(dataDailyJSON =>{

            console.log(dataDailyJSON)
        })
        
}



const showWeather =(data)=>{
    const {name, main:{temp,temp_min,temp_max}, weather:[arr]} = data;
    const degrees = kelvinToCentigradetemp(temp);
    const minDegrees = kelvinToCentigradetemp(temp_min);
    const maxDegrees = kelvinToCentigradetemp(temp_max);
    
    const content = document.createElement('section');
    content.classList.add =('section-data-weather')
    content.innerHTML = `
            <h3>Clima en ${name}</h2>
            <img src='https://openweathermap.org/img/wn/${arr.icon}@2x.png' alt'Weather Icon'>
            <p>${arr.main}, ${arr.description}</p>
            <h2>${degrees}°C</h2>
            <p>Max: ${maxDegrees}°C</p>
            <p>Min: ${minDegrees}°C</p>`
    result.appendChild(content);
}

const showError=(message)=>{
    console.log(message);
    const alert = document.createElement('p');
    alert.classList.add('alert=message');
    alert.innerHTML = message;
    form.appendChild(alert);
    setTimeout(()=>{
        alert.remove();
    }, 1000);
}
const clearHTML =()=>{
    result.innerHTML = ''
}

const kelvinToCentigradetemp=(temp)=>parseInt(temp - 273.15);

