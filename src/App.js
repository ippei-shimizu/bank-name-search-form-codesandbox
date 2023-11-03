import { useState, useEffect } from "react";
import "./styles.css";

export default function App() {
  const [bankName, setBankName] = useState("");
  const [suggestedBanks, setSuggestedBanks] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isSuggestedOpen, setIsSuggestedOpen] = useState(true);
  const [bankCode, setBankCode] = useState("");
  const [branchCode, setBranchCode] = useState("");
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
          bank.kana.includes(value)
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

  // 該当の銀行名が見つからない時に表示
  const bankNameMessage = () => {
    if (!isFocused && bankName.length === 0) return null;
    if (bankName.length === 0 || suggestedBanks.length === 0) {
      return <li className="error-text">該当の銀行は見つかりません</li>;
    }
    return suggestedBanks.map((bank) => (
      <li
        key={bank.code}
        className="bank-name"
        onClick={() => handleBankNameClick(bank.normalize.name)}
      >
        {bank.normalize.name}
      </li>
    ));
  };

  // サジェストされた銀行名を選択
  const handleBankNameClick = (name) => {
    setBankName(name);
    setSuggestedBanks([]);
    setIsSuggestedOpen(false);
  };

  // const handleBranchCodeChange = async(e) => {
  //   const value = e.target.value;
  //   setBranchCode(value);

  //   if(value.length === 3 && bankCode.length === 4) {

  //   }
  // }

  return (
    <>
      <form className="form">
        <div className="form-box">
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
        <div className="form-box">
          <label htmlFor="BankCode">金融機関コード</label>
          <input
            id="BankCode"
            className="input-form"
            placeholder="例）0001"
            // value={bankCode}
          ></input>
        </div>
        {/* <div className="form-box">
          <label htmlFor="inputBranchCode">支店コード</label>
          <input
            id="inputBranchCode"
            className="input-form"
            placeholder="例）000"
            type="text"
            value={branchCode}
            onChange={handleBranchCodeChange}
          ></input>
        </div> */}
        {/* <div className="form-box">
          <label htmlFor="inputBranchName">支店名</label>
          <input
            id="inputBranchName"
            className="input-form"
            placeholder="例）丸の内中央"
            type="text"
            
          ></input>
        </div> */}
      </form>
    </>
  );
}
