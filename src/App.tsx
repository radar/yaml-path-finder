import React, { useState } from "react";
import yaml from "js-yaml";
import { propertyOf } from "underscore";
import "./styles/tailwind.css";

type KeyProps = {
  yamlKey: string;
  value: any;
};

const renderObject = (object: {}) => {
  return Object.entries(object).map(([key, value]) => {
    return <Key yamlKey={key} value={value} />;
  });
};

function Key(props: KeyProps) {
  return (
    <div className="flex">
      <div className="w-1/2">{props.yamlKey}</div>{" "}
      <div className="w-1/2">{props.value}</div>
    </div>
  );
}

const defaultYaml = `hello:
  from:
    your:
      favourite:
        yaml:
          tool: 👋
`;

const parsedDefaultYaml = yaml.safeLoad(defaultYaml.trim(), { json: true });

function App() {
  const [parsedYaml, setParsedYaml] = useState(parsedDefaultYaml);
  const [search, setSearch] = useState("");

  const updateYaml = (text: string) => {
    if (text !== "") {
      const loadedYaml = yaml.safeLoad(text, { json: true });

      setParsedYaml(loadedYaml);
    }
  };

  const findValue = (value: string) => {
    if (value === "") {
      return;
    }
    const parts = value.split(".");
    const foundValue = propertyOf(parsedYaml)(parts);
    if (foundValue) {
      return (
        <div className="mt-4">
          <span className="text-green-600">
            Found a value at path: {search}
          </span>
          <pre className="bg-gray-200 p-4 rounded mt-4">
            <code>{JSON.stringify(foundValue, null, 2)}</code>
          </pre>
        </div>
      );
    } else {
      return (
        <div className="text-red-600">
          Could not find anything at path: {search}
        </div>
      );
    }
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
