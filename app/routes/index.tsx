import abi from "../../utils/BuyMeACoffee.json";
import { ethers } from "ethers";
import { useState, useEffect } from "react";
export default function CoffeeHome() {
  // contract abi
  const contractAddress = "0x95cE9e99e39e91aEeF12B8A1E3E44aE752Df9BcB";
  const contractABI = abi.abi;

  const [currentAccount, setCurrentAccount] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [memos, setMemos] = useState([]);

  const onNameChange = (event) => {
    setName(event.target.value);
  };

  const onMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const isWalletConnected = async () => {
    try {
      const { ethereum } = window;

      const accounts = await ethereum.request({ method: "eth_accounts" });
      console.log("accounts: ", accounts);

      if (accounts.length > 0) {
        const account = accounts[0];
        console.log("wallet is connected! " + account);
      } else {
        console.log("make sure MetaMask is connected");
      }
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const connectWallet = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("");
      return;
    }

    const accounts = await ethereum.request({
      method: "eth_requestAccounts",
    });

    setCurrentAccount(accounts[0]);
  };

  const buyCoffee = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const singer = provider.getSigner();
        const buyMecoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          singer
        );
        console.log("start buy coffee");

        const coffeTxn = await buyMecoffee.buyCoffee(
          name || "someone",
          message || "thanks",
          { value: ethers.utils.parseEther("0.0001") }
        );

        await coffeTxn.wait();

        setName("");
        setMessage("");
      }
    } catch (error) {}
  };

  // fetch all memos on chain
  const getMemos = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const singer = provider.getSigner();
        const buyMecoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          singer
        );
        console.log("fetching memos from block-chain");
        const memos = await buyMecoffee.getMemos();
        setMemos(memos);
      }
    } catch (error) {}
  };

  useEffect(() => {
    isWalletConnected();
    getMemos();

    let buyMecoffee;

    const onNewMemo = (from, timestamp, name, message) => {
      setMemos((preState) => [
        ...preState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message,
          name,
        },
      ]);
    };

    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum, "any");
      const singer = provider.getSigner();
      buyMecoffee = new ethers.Contract(contractAddress, contractABI, singer);
      // listen newMemo

      buyMecoffee.on("newMemo", onNewMemo);
    }

    return () => {
      if (buyMecoffee) {
        buyMecoffee.off("newMemo", onNewMemo);
      }
    };
  }, []);

  return (
    <div>
      {/* <Head>
        <title>Buy Albert a Coffee!</title>
        <meta name="description" content="Tipping site" />
        <link rel="icon" href="/favicon.ico" />
      </Head> */}

      <main>
        <h1>Buy me a Coffee!</h1>

        {currentAccount ? (
          <div>
            <form>
              <div className="formgroup">
                <label>Name</label>
                <br />

                <input
                  id="name"
                  type="text"
                  placeholder="anon"
                  onChange={onNameChange}
                />
              </div>
              <br />
              <div className="formgroup">
                <label>Send Albert a message</label>
                <br />

                <textarea
                  rows={3}
                  placeholder="Enjoy your coffee!"
                  id="message"
                  onChange={onMessageChange}
                  required
                ></textarea>
              </div>
              <div>
                <button type="button" onClick={buyCoffee}>
                  Send 1 Coffee for 0.001ETH
                </button>
              </div>
            </form>
          </div>
        ) : (
          <button onClick={connectWallet}> Connect your wallet </button>
        )}
      </main>

      {currentAccount && <h1>Memos received</h1>}

      {currentAccount &&
        memos.map((memo, idx) => {
          return (
            <div
              key={idx}
              style={{
                border: "2px solid",
                "border-radius": "5px",
                padding: "5px",
                margin: "5px",
              }}
            >
              <p style={{ "font-weight": "bold" }}>"{memo.message}"</p>
              <p>
                From: {memo.name} at {memo.timestamp.toString()}
              </p>
            </div>
          );
        })}
    </div>
  );
}
