// Copyright (c) OptionC. All rights reserved.

using Newtonsoft.Json;

namespace Automation.Framework.JsonTestData
{
    public static class JsonDataReader
    {
        // TestData is copied next to the test assembly by each project's
        // <Content Include="TestData\**" />, so the files are found from the
        // base directory. The previous version stripped a hardcoded
        // "\bin\Debug\net6.0" out of the path, which silently broke the moment
        // the configuration or target framework changed.
        private static readonly string _testDataDirectory =
            Path.Combine(AppContext.BaseDirectory, "TestData");

        public static object GetJsonData(string projectName)
        {
            var (fileName, type) = projectName switch
            {
                "Acutis" => ("AcutisTestData.json", typeof(AcutisJsonDataObjects)),
                "CFR" => ("CFRTestData.json", typeof(AcutisJsonDataObjects)),
                _ => throw new ArgumentException(
                        $"No test data is registered for project '{projectName}'.",
                        nameof(projectName)),
            };

            string path = Path.Combine(_testDataDirectory, fileName);
            if (!File.Exists(path))
            {
                // Failing loudly beats the previous empty catch block, which
                // returned null and surfaced as a NullReferenceException deep
                // inside a step definition.
                throw new FileNotFoundException(
                    $"Test data file for '{projectName}' was not found. " +
                    $"Check that TestData is copied to the output folder.", path);
            }

            return JsonConvert.DeserializeObject(File.ReadAllText(path), type)
                ?? throw new InvalidOperationException(
                    $"Test data file '{path}' did not deserialise into a {type.Name}.");
        }
    }
}