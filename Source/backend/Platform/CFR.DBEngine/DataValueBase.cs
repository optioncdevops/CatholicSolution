// Copyright (c) OptionC. All rights reserved.

namespace CFR.DBEngine
{
    public class DataValueBase(string fieldName, string fieldValue, DBEnumCommand.DataType dataType)
    {
        public string FieldName { set; get; } = fieldName;

        public string FieldValue { set; get; } = fieldValue;

        public DBEnumCommand.DataType FieldDataType { set; get; } = dataType;
    }

    /// <summary>
    /// Store the Values in the List object
    /// </summary>
    public class DataValue
    {
        private readonly List<DataValueBase> _dataItem = new();

        public int Count => _dataItem.Count;

        public DataValueBase this[int index]
        {
            get => _dataItem[index];
        }

        public void Add(string fieldName, string fieldValue, DBEnumCommand.DataType dataType)
        {
            _dataItem.Add(new DataValueBase(fieldName, fieldValue, dataType));
        }

        public void Add(string fieldName, object fieldValue, DBEnumCommand.DataType dataType = DBEnumCommand.DataType.Varchar)
        {
            Add(fieldName, fieldValue?.ToString() ?? string.Empty, dataType);
        }

        public DataValueBase GetItem(int index)
        {
            return _dataItem[index];
        }

        // Added by Justine on 23-Nov-2017 - Get Index by Field name
        public DataValueBase GetItem(string byKey)
        {
            int index = 0;
            try
            {
                index = _dataItem.FindIndex(a => a.FieldName == byKey);
            }
            catch (Exception)
            {
                //new ErrorLog().WriteLog(ex);
            }

            return _dataItem[index];
        }

        // Added by Justine on 23-Nov-2017 - Get Index by Field name
        public string GetItembyName(string byKey = "")
        {
            int index = 0;
            string fieldValue = string.Empty;
            try
            {
                index = _dataItem.FindIndex(a => a.FieldName == byKey);
                fieldValue = _dataItem[index].FieldValue;
            }
            catch (Exception)
            {
                //new ErrorLog().WriteLog(ex);
            }

            return fieldValue;
        }

        public void Clear()
        {
            _dataItem.Clear();
        }

        public void Remove(DataValueBase dv)
        {
            _ = _dataItem.Remove(dv);
        }

        public void RemoveItem(int index)
        {
            _dataItem.RemoveAt(index);
        }

        public void RemoveItem(string byKey)
        {
            int index = 0;
            try
            {
                index = _dataItem.FindIndex(a => a.FieldName == byKey);
            }
            catch (Exception)
            {
                //new ErrorLog().WriteLog(ex);
            }
            _dataItem.RemoveAt(index);
        }

        public IEnumerator GetEnumerator()
        {
            return _dataItem.GetEnumerator();
        }
    }
}
