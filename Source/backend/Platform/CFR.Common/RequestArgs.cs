// Copyright (c) OptionC. All rights reserved.

namespace CFR.Common
{
    public class RequestArgs
    {
        public int Draw { get; set; }
        public int Start { get; set; }

        public int Length
        {
            get; set;
        }

        //public string orderBy { get; set; }
        public Search Search { get; set; } = null!;

        public List<Order> Order { get; set; } = null!;
        public List<Columns> Columns { get; set; } = null!;

        public string SearchValue => Search.Value.Trim();
        public string[] SearchValueList => string.IsNullOrWhiteSpace(Search.Value) ? [] : Search.Value.Trim().Split(' ');

        public string SortColumn
        {
            get
            {
                if (Order != null && Order.Count > 0 && Columns != null && Columns.Count > Order[0].Column)
                {
                    return Columns[Order[0].Column].Data;
                }
                return string.Empty;
            }
        }

        public string SortColumnDirection => Order != null && Order.Count > 0 ? Order[0].Dir : string.Empty;

        public int PageSize => Length;
        public int Skip => Start;
    }

    public class ResponseData<T>(int draw, int recordsFiltered, int recordsTotal, List<T> data)
    {
        public int Draw { get; set; } = draw;
        public int RecordsFiltered { get; set; } = recordsFiltered;
        public int RecordsTotal { get; set; } = recordsTotal;
        public List<T> Data { get; set; } = data;
    }

    public class Order
    {
        public int Column { get; set; }
        public string Dir { get; set; } = null!;
    }

    public class Search
    {
        public string Value { get; set; } = null!;
        public bool Regex { get; set; }
    }

    public class Columns
    {
        public string Data { get; set; } = null!;
        public string Name { get; set; } = null!;
        public Search Search { get; set; } = null!;
        public bool Searchable { get; set; }
    }
}
