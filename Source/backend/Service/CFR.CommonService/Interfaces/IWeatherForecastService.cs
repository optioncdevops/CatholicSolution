// Copyright (c) OptionC. All rights reserved.

using CFR.Common;
using CFR.CommonService.Service;

namespace CFR.CommonService.Interfaces
{
    public interface IWeatherForecastService
    {
        #region Get A la Carte Alerts Details

        /// <summary>
        /// Retrieves All the A la Carte Alerts that is been inserted
        /// </summary>
        /// <returns></returns>
        Task<ResultArgs<List<WeatherForecast>>> GetSummaries();

        #endregion Get A la Carte Alerts Details
    }
}
