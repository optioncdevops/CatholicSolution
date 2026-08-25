// Copyright (c) OptionC. All rights reserved.

using System.Linq.Expressions;

namespace CFR.Common.Extension
{
    public static class QueryableExtensions
    {
        public static IQueryable<T> ApplyOrdering<T>(this IQueryable<T> query, string sortColumn, string sortDirection = "asc")
        {
            var parameter = Expression.Parameter(typeof(T), "e");

            try
            {
                var orderByExpression = Expression.Property(parameter, sortColumn);
                var lambda = Expression.Lambda<Func<T, object>>(Expression.Convert(orderByExpression, typeof(object)), parameter);

                return string.Equals(sortDirection, Constant.Common.asc, StringComparison.OrdinalIgnoreCase)
                    ? query.OrderBy(lambda)
                    : query.OrderByDescending(lambda);
            }
            catch (Exception)
            {
                throw;
            }
        }

        public static IQueryable<T> ApplyPagination<T>(this IQueryable<T> query, int pageNumber, int pageSize)
        {
            pageNumber = pageNumber > 0 ? pageNumber : 1;
            pageSize = pageSize > 0 ? pageSize : 10;

            return query.Skip((pageNumber - 1) * pageSize).Take(pageSize);
        }
    }
}
