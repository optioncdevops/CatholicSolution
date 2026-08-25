// Copyright (c) OptionC. All rights reserved.

using CFR.Common;
using CFR.CommonService.Interfaces;

using Microsoft.Extensions.Logging;

namespace CFR.CommonService.Service
{
    public class WeatherForecast
    {
        public DateOnly Date { get; set; }

        public int TemperatureC { get; set; }

        public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);

        public string? Summary { get; set; }
    }

    public class WeatherForecastService(): IWeatherForecastService
    {
        private static readonly List<WeatherForecast> _weatherForecastList = new()
{
    new WeatherForecast { Date = DateOnly.FromDateTime(DateTime.Now.AddDays(1)), TemperatureC = -5, Summary = "Freezing" },
    new WeatherForecast { Date = DateOnly.FromDateTime(DateTime.Now.AddDays(2)), TemperatureC = 0, Summary = "Bracing" },
    new WeatherForecast { Date = DateOnly.FromDateTime(DateTime.Now.AddDays(3)), TemperatureC = 5, Summary = "Chilly" },
    new WeatherForecast { Date = DateOnly.FromDateTime(DateTime.Now.AddDays(4)), TemperatureC = 10, Summary = "Cool" },
    new WeatherForecast { Date = DateOnly.FromDateTime(DateTime.Now.AddDays(5)), TemperatureC = 18, Summary = "Mild" },
    new WeatherForecast { Date = DateOnly.FromDateTime(DateTime.Now.AddDays(6)), TemperatureC = 24, Summary = "Warm" },
    new WeatherForecast { Date = DateOnly.FromDateTime(DateTime.Now.AddDays(7)), TemperatureC = 28, Summary = "Balmy" },
    new WeatherForecast { Date = DateOnly.FromDateTime(DateTime.Now.AddDays(8)), TemperatureC = 32, Summary = "Hot" },
    new WeatherForecast { Date = DateOnly.FromDateTime(DateTime.Now.AddDays(9)), TemperatureC = 38, Summary = "Sweltering" },
    new WeatherForecast { Date = DateOnly.FromDateTime(DateTime.Now.AddDays(10)), TemperatureC = 42, Summary = "Scorching" }
};

        #region Get A la Carte Alerts Details

        /// <summary>
        /// Retrieves All the A la Carte Alerts that is been inserted
        /// </summary>
        /// <returns></returns>
        public async Task<ResultArgs<List<WeatherForecast>>> GetSummaries()
        {
            ResultArgs<List<WeatherForecast>> resultArgs = new();
            try
            {
                resultArgs.ResultData = _weatherForecastList;
            }
            catch (Exception)
            {
            }
            return await Task.FromResult(resultArgs);
        }

        #endregion Get A la Carte Alerts Details
    }
}
