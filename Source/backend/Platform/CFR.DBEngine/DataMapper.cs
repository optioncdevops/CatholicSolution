// Copyright (c) OptionC. All rights reserved.

namespace CFR.DBEngine
{
    public class DataMapper
    {
        public static T XmlReaderToObject<T>(XmlReader xr)
        {
            ArgumentNullException.ThrowIfNull(xr);
            XmlSerializer serializer = new(typeof(T));

            return (T)(serializer.Deserialize(xr)
                ?? throw new InvalidOperationException($"Failed to deserialize {typeof(T).Name} from XML reader."));
        }

        public static T XmlStringToObject<T>(string xml)
        {
            ArgumentNullException.ThrowIfNull(xml);
            XmlSerializer serializer = new(typeof(T));
            using TextReader tr = new StringReader(xml);

            return (T)(serializer.Deserialize(tr)
                ?? throw new InvalidOperationException($"Failed to deserialize {typeof(T).Name} from XML string."));
        }

        public static List<T> DataReaderToList<T>(IDataReader dr) where T : new()
        {
            ArgumentNullException.ThrowIfNull(dr);

            var businessEntityType = typeof(T);
            List<T> entitys = new List<T>();
            Hashtable hashtable = new Hashtable();
            var properties = businessEntityType.GetProperties();

            foreach (var info in properties)
            {
                hashtable[info.Name.ToUpper()] = info;
            }

            while (dr.Read())
            {
                T newObject = new T();
                for (int index = 0; index < dr.FieldCount; index++)
                {
                    PropertyInfo? info = hashtable[dr.GetName(index).ToUpper()] as PropertyInfo;
                    if ((info != null) && info.CanWrite)
                    {
                        info.SetValue(newObject, dr.GetValue(index), null);
                    }
                }
                entitys.Add(newObject);
            }
            dr.Close();
            return entitys;
        }

        public static List<T> XmlReaderToList<T>(XmlReader xr, string root = "")
        {
            ArgumentNullException.ThrowIfNull(xr);

            if (root == "")
            {
                root = typeof(T).Name + "s";
            }

            XmlSerializer serializer = new(typeof(List<T>), new XmlRootAttribute(root));

            if (serializer.Deserialize(xr) is List<T> result)
            {
                return result;
            }

            return new List<T>();
        }
    }
}