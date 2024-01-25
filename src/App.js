import React, { useState, useEffect } from 'react';
import './App.css';
import logo from './logo.png';
import axios from 'axios';

function App() {
  const [numbers, setNumbers] = useState(['']);
  const [target, setTarget] = useState('');
  const [includeDecimals, setIncludeDecimals] = useState(false);
  const [approxMode, setApproxMode] = useState(false);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [elapsedTime, setElapsedTime] = useState(null);
  const [progress, setProgress] = useState(0);

  const isInResults = (num, results) => {
    return results.some(subset => subset.includes(num));
  };



  const getSequenceNumbers = (num, numbers) => {
    // When includeDecimals is true, match the sequence numbers with exact decimal places
    // When includeDecimals is false, round the numbers before comparison
    return numbers
      .map((n, index) => {
        const inputNum = includeDecimals ? parseFloat(n) : Math.round(parseFloat(n) * 100) / 100;
        const comparisonNum = includeDecimals ? parseFloat(num) : Math.round(parseFloat(num) * 100) / 100;
        return inputNum === comparisonNum ? index + 1 : null;
      })
      .filter(index => index !== null);
  };


  const handleNumberChange = (index, event) => {
    const newNumbers = [...numbers];
    newNumbers[index] = event.target.value;
    setNumbers(newNumbers);
  };

  const addNumberField = () => {
    setNumbers([...numbers, '']);
  };

  const handleTargetChange = (event) => {
    setTarget(event.target.value);
  };

  const handleFetchFromClipboard = async () => {

    try {

      navigator.permissions.query({ name: "clipboard-write" }).then((result) => {
        if (result.state === "granted" || result.state === "prompt") {
          /* write to the clipboard now */
          console.log(result);
        }
      });


      const text = await navigator.clipboard.readText();
      const clipboardNumbers = text.split(/\n/)
        .map(entry => entry.replace(',', '').trim())
        .filter(entry => entry !== '')
        .map(entry => Number(entry));
      setNumbers([...clipboardNumbers, '']);
    } catch (err) {
      setError('Failed to fetch numbers from clipboard.');
    }
  };


  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    setResults([]);
    setStatusMessage('Calculating...');
    setProgress(0);
    const startTime = Date.now();
    //   let timeout = true
    setTimeout(async () => {
      console.log('checking ')
    }, 1000)

    const processedNumbers = numbers
      .map(n => n.toString().trim())
      .filter(n => n !== '' && !isNaN(n))
      .map(num => includeDecimals ? parseFloat(num) : Math.round(parseFloat(num) * 100) / 100);

    const processedTarget = includeDecimals
      ? parseFloat(target).toFixed(2)
      : Math.round(parseFloat(target));


    console.log(processedNumbers);
    try {
      if (isNaN(processedTarget)) {
        throw new Error('Invalid target sum. Please enter a valid number.');
      }


      const _data = {
        numbers: processedNumbers,
        target: processedTarget,
        includeDecimals,
        approxMode
      }

      console.log(_data);

      const data = await axios.post('http://18.191.23.206:3002/api/calculate', _data)

      console.log("dataaa ", data.data);
      // const resdata = data.data; ̰

      // console.log("loaded data",resdata );

      // //   const data = await response.json();
        setResults(data.data);
        setStatusMessage(data.length > 0 ? 'Subsets found.' : 'No subsets found.');

    } catch (err) {
      setError(err.message);
      console.log(err);
      setStatusMessage('An error occurred during calculation.');
    } finally {
      setIsLoading(false);
      setElapsedTime(((Date.now() - startTime) / 1000).toFixed(2));
    }
  };

  const resetCalculator = () => {
    setNumbers(['']);
    setTarget('');
    setResults([]);
    setIsLoading(false);
    setError('');
    setStatusMessage('');
    setElapsedTime(null);
    setProgress(0);
  };

  const copyToClipboard = (subset) => {
    const subsetString = subset.map(String).join('\n');
    navigator.clipboard.writeText(subsetString);
  };

  useEffect(() => {
    let interval;
    if (isLoading) {
      interval = setInterval(() => {
        setProgress(prevProgress => {
          if (prevProgress >= 100) {
            clearInterval(interval);
            return 100;
          }
          return Math.min(prevProgress + 10, 100);
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isLoading]);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>Subset Sum Calculator</h1>
      </header>

      <div className="input-section">
        <div className="input-section">
          {numbers.map((number, index) => {
            // Check if this number is part of any of the subsets in results
            const isNumberInResults = isInResults(number, results);
            return (
              <div key={index} className="number-input-container">
                {/* Apply the sequence-number class only if the number is in the results */}
                <span className={`sequence-highlight ${isNumberInResults ? 'sequence-number' : ''}`}>
                  {index + 1}
                </span>
                <input
                  type="text"
                  value={number}
                  onChange={(e) => handleNumberChange(index, e)}
                  className="input-field"
                  // Optionally, highlight the input field itself if it's part of the results
                  style={isNumberInResults ? { borderColor: '#3498db' } : {}}
                />
              </div>
            );
          })}
        </div>
        <div className="input-controls">
          <button onClick={addNumberField} className="add-number-btn">Add Number</button>
          <button onClick={handleFetchFromClipboard} className="clipboard-btn">Fetch from Clipboard</button>
        </div>
      </div>

      <div className="target-input">
        <input
          type="text"
          value={target}
          onChange={handleTargetChange}
          placeholder="Target Sum"
          className="input-field target-input"
        />
        <label>
          <input
            type="checkbox"
            checked={includeDecimals}
            onChange={() => setIncludeDecimals(!includeDecimals)}
          />
          Include Decimals
        </label>
        <button onClick={handleSubmit} disabled={isLoading} className="calculate-btn">
          {isLoading ? 'Calculating...' : 'Calculate'}
        </button>
      </div>

      <div className="approx-controls">
        <button onClick={() => setApproxMode(!approxMode)} className="approx-btn">
          {approxMode ? 'Disable' : 'Enable'} Approximation
        </button>
      </div>


      {isLoading && (
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
      )}
      {error && <div className="error-message">{error}</div>}
      {statusMessage && <div className="status-message">{statusMessage}</div>}
      {elapsedTime !== null && <div className="elapsed-time">Elapsed Time: {elapsedTime} seconds</div>}

      <div className="results-container">
        {results.length > 0 && (
          <div className="subsets-display">
            {results.map((subset, idx) => (
              <div key={idx} className="subset-container">
                <table className="results-table">
                  <tbody>
                    {subset.map((num, numIdx) => {
                      // Find the sequence numbers for the current number in the subset
                      const sequenceNums = getSequenceNumbers(num, numbers);
                      return (
                        <tr key={numIdx}>
                          {/* Display the sequence numbers */}
                          <td className="sequence-number">{sequenceNums.join(', ')}</td>
                          <td>{includeDecimals ? num : Math.round(num)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <button onClick={() => copyToClipboard(subset)} className="copy-btn">Copy Subset</button>
              </div>
            ))}
          </div>
        )}
      </div>



      <button onClick={resetCalculator} className="reset-btn">Reset</button>

      <footer className="app-footer">
        <p>Designed and Developed by Ankit Kumar Agarwal</p>
      </footer>
    </div>
  );
}

export default App;
