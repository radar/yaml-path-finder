import React, { useState } from "react";
import yaml from "js-yaml";
import { propertyOf } from "underscore";
import "./styles/tailwind.css";

const defaultYaml = `hello:
  from:
    your:
      favourite:
        yaml:
          tool: 👋
`;

const parsedDefaultYaml = yaml.safeLoad(defaultYaml.trim(), { json: true });
function getDeepKeys(obj: any) {
  let keys: Array<string> = [];
  for (let key in obj) {
    keys.push(key);
    if (typeof obj[key] === "object") {
      let subkeys = getDeepKeys(obj[key]);
      keys = keys.concat(
        subkeys.map((subkey) => {
          return key + "." + subkey;
        })
      );
    }
  }
  return keys;
}

function App() {
  const [parsedYaml, setParsedYaml] = useState(parsedDefaultYaml);
  const [keys, setKeys] = useState<Array<string>>(
    getDeepKeys(parsedDefaultYaml)
  );
  const [search, setSearch] = useState("");

  const updateYaml = (text: string) => {
    if (text !== "") {
      const loadedYaml = yaml.safeLoad(text, { json: true });

      setParsedYaml(loadedYaml);
      setKeys(getDeepKeys(loadedYaml));
    }
  };

  const exactMatch = (parts: Array<string>) => {
    const foundValue = propertyOf(parsedYaml)(parts);
    if (foundValue) {
      return (
        <div className="mt-4">
          <span className="text-green-600">
            Found a value at path: <code>{parts.join(".")}</code>
          </span>
          <pre className="bg-gray-200 p-4 rounded mt-4">
            <code>{JSON.stringify(foundValue, null, 2)}</code>
          </pre>
        </div>
      );
    }
  };

  const prefixMatch = (value: string) => {
    const foundKeys = keys.filter((key) => key.startsWith(value));
    if (foundKeys.length === 0) {
      return null;
    }

    if (foundKeys.length === 1) {
      return exactMatch(foundKeys[0].split("."));
    }

    return (
      <div className="mt-4">
        <span className="text-green-600">
          Found {foundKeys.length} keys beginning with: {search}
        </span>
        <p className="text-yellow-700">
          Narrow down your search to see the values for these keys.
        </p>
        <pre className="bg-gray-200 p-4 rounded mt-4">
          <code>{JSON.stringify(foundKeys, null, 2)}</code>
        </pre>
      </div>
    );
  };

  const suffixMatch = (value: string) => {
    const foundKeys = keys.filter((key) => key.endsWith(value));
    if (foundKeys.length === 0) {
      return null;
    }

    if (foundKeys.length === 1) {
      return exactMatch(foundKeys[0].split("."));
    }

    return (
      <div className="mt-4">
        <span className="text-green-600">
          Found {foundKeys.length} keys ending with: {search}
        </span>
        <p className="text-yellow-700">
          Narrow down your search to see the values for these keys.
        </p>
        <pre className="bg-gray-200 p-4 rounded mt-4">
          <code>{JSON.stringify(foundKeys, null, 2)}</code>
        </pre>
      </div>
    );
  };

  const findValue = (value: string) => {
    if (value === "") {
      return;
    }

    const exactMatchValue = exactMatch(value.split("."));
    if (exactMatchValue) {
      return exactMatchValue;
    }

    const suffixMatchValue = suffixMatch(value);
    if (suffixMatchValue) {
      return suffixMatchValue;
    }

    const prefixMatchValue = prefixMatch(value);
    if (prefixMatchValue) {
      return prefixMatchValue;
    }

    return (
      <div className="text-red-600 mt-4">
        Could not find anything for: {search}. We tried:
        <ol className="list-decimal list-inside">
          <li>Keys that were exactly {search}</li>
          <li>Keys ending with {search}</li>
          <li>Keys beginning with {search}</li>
        </ol>
      </div>
    );
  };

  return (
    <div className="App p-8 h-full">
      <div>
        <h1 className="text-xl font-bold">YAML Path Finder</h1>
        <p>
          Use this tool to track down a particular path within a YAML file. Put
          your YAML on the left, and enter your key on the right.
        </p>

        <p>Any matches will be displayed in JSON on the right hand side.</p>
      </div>
      <div className="flex h-full mt-8">
        <div className="w-1/2 mr-8">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            YAML goes here
          </label>
          <textarea
            defaultValue={defaultYaml}
            className="appearance-none border border-gray-400 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-full yaml-goes-here"
            onBlur={(e) => updateYaml(e.currentTarget.value)}
          ></textarea>
        </div>
        <div className="w-1/2">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Find by a key (example: "hello.from")
            </label>
            <span className="text-gray-600 italic">
              You can also search by prefix or suffix: (try: "hello" or "tool")
            </span>
            <input
              type="text"
              className="appearance-none border border-gray-400 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Find a key"
              onChange={(e) => setSearch(e.currentTarget.value)}
            />
          </div>
          {findValue(search)}
        </div>
      </div>
    </div>
  );
}

export default App;
