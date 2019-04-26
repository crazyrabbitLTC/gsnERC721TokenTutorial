import React from "react";
import { Blockie } from "rimble-ui";

const TokenList = (props) => {
  const demoData = [
    {
      seed: "ffo",
      color: "#dfe",
      bgcolor: "#a71",
      size: 15,
      scale: 3,
      spotcolor: "#000"
    },
    {
      seed: "fdofdsdsdfao",
      color: "#dbe",
      bgcolor: "#b71",
      size: 15,
      scale: 3,
      spotcolor: "#000"
    },
    {
      seed: "fvo",
      color: "#dae",
      bgcolor: "#a11",
      size: 15,
      scale: 3,
      spotcolor: "#000"
    },
    {
      seed: "fso",
      color: "#dfe",
      bgcolor: "#a21",
      size: 15,
      scale: 3,
      spotcolor: "#000"
    },
    {
      seed: "fgo",
      color: "#dce",
      bgcolor: "#c51",
      size: 15,
      scale: 3,
      spotcolor: "#000"
    }
  ];

  const listDemoData = demoData.map((block) => (<Blockie key={block.seed} opts={block}/>));

  return (
    <div>
      <div>
{listDemoData}
      </div>
    </div>
  );
};

export default TokenList;
