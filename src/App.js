import "./App.css";
import { useState, useEffect } from "react";
import WertModule from "@wert-io/module-react-component";
import { signSmartContractData } from "@wert-io/widget-sc-signer";
import { v4 as uuidv4 } from "uuid";
import { Buffer } from "buffer/";
import { useSearchParams } from "react-router-dom";
import base64url from "base64url";

function App() {
  window.Buffer = Buffer;
  const [searchParams, setSearchParams] = useSearchParams();
  const [options, setOptions] = useState(null);
  const privateKey = process.env.REACT_APP_PRIVATE_KEY;
  const partnerId = process.env.REACT_APP_PARTNER_ID;
  useEffect(() => {
    const fa = searchParams.get("fa");
    const tokenId = searchParams.get("tokenId");
    const askId = searchParams.get("askId");
    const askPrice = searchParams.get("askPrice");
    const address = searchParams.get("address");
    let name = searchParams.get("name");
    name = base64url.decode(name);
    const ipfs = searchParams.get("ipfs");
    if (fa && tokenId && askId && askPrice && address && name) {
      const signedData = signSmartContractData(
        {
          address: address,
          commodity: "XTZ",
          commodity_amount: (parseInt(askPrice) / 10 ** 6).toString(),
          pk_id: "key1",
          sc_address: "KT1WvzYHCNBvDSdwafTHv7nJ1dWmZ8GCYuuC",
          sc_id: uuidv4(), // must be unique for any request
          sc_input_data:
            "0x" +
            Buffer.from(
              `{ "entrypoint": "fulfill_ask", "value": { "prim": "Pair", "args": [ { "int": "${askId}" }, { "prim": "Some", "args": [ { "string": "${address}" } ] } ] } }`,
              "utf8"
            ).toString("hex"),
        },
        privateKey
      );

      console.log(signedData);
      const otherWidgetOptions = {
        partner_id: partnerId,
        container_id: "widget",
        click_id: uuidv4(), // unique id of purhase in your system
        origin: "https://widget.wert.io", // this option needed only for this example to work
        height: 600,
        width: 400,
        theme: "dark",
        color_background: "#000000",
        color_secondary_text: "#958E99",
        color_buttons: "#FF006E",
        color_icons: "#958E99",
        color_links: "#FF006E",

        listeners: {
          loaded: () => console.log("loaded"),
          payment_status: (data) => {
            console.log(data);
          },
        },
      };
      setOptions({
        ...signedData,
        ...otherWidgetOptions,
        extra: {
          item_info: {
            /* image_url: `https://assets.objkt.media/file/assets-003/${fa}/${tokenId}/thumb400`, */
            image_url: `https://ipfs.io/ipfs/${ipfs}`,
            name: name,
          },
        },
      });
    }
  }, []);

  return (
    <div className="App">
      {options ? (
        <WertModule options={options} style={{ padding: "10" }} />
      ) : (
        <div>
          <h2 style={{ color: "white" }}>Loading...</h2>
        </div>
      )}
    </div>
  );
}

export default App;

//http://localhost:3000/?fa=KT1WkviqkcHaUL6Axh9zFTrpDqitEqC38vCW&tokenId=7&address=tz1WDRu8H4dHbUwygocLsmaXgHthGiV6JGJG&askId=2344&askPrice=13000000&name=Architectural%20Liberty%201%20I%20Kenchiku%20no%20jiy%C5%AB%201%20I%20%E5%BB%BA%E7%AF%89%E3%81%AE%E8%87%AA%E7%94%B1

//https://naan-nft-credit-card.netlify.app/?fa=KT1PM918cFGncYaMd3jzdAzsQGLtGUg2AVzQ&tokenId=0&address=tz1WDRu8H4dHbUwygocLsmaXgHthGiV6JGJG&askId=2830045&askPrice=2000000&name=Matrix&ipfs=QmP4xrwWZxxSC1mCCrLGFQxRgWctListSUdbsm7yn3r2w7
