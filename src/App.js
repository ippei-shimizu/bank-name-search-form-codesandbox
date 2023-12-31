import { useState, useEffect } from "react";
import "./styles.css";

export default function App() {
  const [bankName, setBankName] = useState("");
  const [suggestedBanks, setSuggestedBanks] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isSuggestedOpen, setIsSuggestedOpen] = useState(true);
  const [bankCode, setBankCode] = useState("");
  const [branchCode, setBranchCode] = useState("");
  const [branchName, setBranchName] = useState("");
  const [allBanks, setAllBanks] = useState([]);

  useEffect(() => {
    const fetchAllBanks = async () => {
      let fetchedBanks = [];
      let currentPage = 1;
      let hasMore = true;

      while (currentPage <= 24) {
        const api = `https://bank.teraren.com/banks.json?page=${currentPage}`;
        const response = await fetch(api);
        const data = await response.json();

        if (data && data.length > 0) {
          fetchedBanks = fetchedBanks.concat(data);
          currentPage += 1;
        } else {
          break;
        }
      }
      setAllBanks(fetchedBanks);
    };
    fetchAllBanks();
  }, []);

  // 銀行名検索で、入力値に一致するデータをサジェストで表示させる
  const handleBankNameInputChange = async (e) => {
    setIsSuggestedOpen(true);
    const value = e.target.value;
    setBankName(value);

    if (value) {
      const filteredData = allBanks.filter(
        (bank) =>
          bank.name.includes(value) ||
          bank.hira.includes(value) ||
          bank.kana.includes(value),
      );
      setSuggestedBanks(filteredData);
    } else {
      setSuggestedBanks([]);
    }
  };

  // focusを判定
  const handleFocus = () => {
    setIsFocused(true);
  };
  const handleBlur = () => {
    setIsFocused(false);
  };

  const bankNameMessage = () => {
    if (!isFocused && bankName.length === 0) return null;
    if (bankName.length === 0 || suggestedBanks.length === 0) {
      return <li className="error-text">該当の銀行は見つかりません</li>;
    }
    return suggestedBanks.map((bank) => (
      <li
        key={bank.code}
        className="bank-name"
        onClick={() => handleBankNameClick(bank.normalize.name, bank.code)}
      >
        {bank.normalize.name}
      </li>
    ));
  };

  // サジェストされた銀行名を選択
  const handleBankNameClick = (name, code) => {
    setBankName(name);
    setBankCode(code);
    setSuggestedBanks([]);
    setIsSuggestedOpen(false);
  };

  // 支店名入力
  const fetchAllBranches = async (bankCode) => {
    let allBranches = [];
    let currentPage = 1;
    let hasMore = true;

    while (hasMore) {
      const api = `https://bank.teraren.com/banks/${bankCode}/branches.json?page=${currentPage}`;
      const response = await fetch(api);
      const data = await response.json();

      if (data && data.length > 0) {
        allBranches = allBranches.concat(data);
        currentPage++;
      } else {
        hasMore = false;
      }
    }
    return allBranches;
  };

  const handleBranchNameChange = async (e) => {
    const value = e.target.value;
    setBranchName(value);

    if (bankCode.length === 4) {
      const branches = await fetchAllBranches(bankCode);
      const branch = branches.find((branch) => branch.name.includes(value));
      if (branch) {
        setBranchCode(branch.code);
      } else {
        setBranchCode("");
      }
    }
  };

  // 支店コード入力
  const handleBranchCodeChange = async (e) => {
    const value = e.target.value;
    setBranchCode(value);

    if (bankCode.length === 4 && value.length === 3) {
      fetch(`https://bank.teraren.com/banks/${bankCode}/branches/${value}.json`)
        .then((response) => response.json())
        .then((json) => {
          setBranchName(json.name);
        })
        .catch((error) => {
          setBranchName("");
        });
    }
  };

  return (
    <>
      <form className="form">
        <div>
          <label htmlFor="searchBank">銀行名</label>
          <input
            id="searchBank"
            className="input-form"
            placeholder="銀行名を検索する"
            value={bankName}
            onChange={handleBankNameInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
          ></input>
          {isSuggestedOpen ? (
            <ul className="bank-name-suggested">{bankNameMessage()}</ul>
          ) : (
            ""
          )}
        </div>
        <div className="form-box-code">
          <label htmlFor="BankCode">金融機関コード</label>
          <input
            id="BankCode"
            className="input-form"
            placeholder="例）0001"
            value={bankCode}
          ></input>
        </div>
        <div className="form-box-branch">
          <label htmlFor="inputBranchName">支店名</label>
          <input
            id="inputBranchName"
            className="input-form"
            placeholder="例）丸の内中央"
            type="text"
            value={branchName}
            onChange={handleBranchNameChange}
          ></input>
        </div>
        <div className="form-box">
          <label htmlFor="inputBranchCode">支店コード</label>
          <input
            id="inputBranchCode"
            className="input-form"
            placeholder="例）000"
            type="text"
            value={branchCode}
            onChange={handleBranchCodeChange}
          ></input>
        </div>
      </form>
    </>
  );
}
