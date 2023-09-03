import {useEffect, useState} from 'react'
import './App.css'
import logo from './assets/full-logo-white.svg'
import {ChevronRight, ChevronDown, Copy} from "lucide-react";

function App() {
    const [inputUrl, setInputUrl] = useState('');
    const [shortUrl, setShortUrl] = useState('');
    const [textCopied, setTextCopied] = useState(false);
    const [shortenFailed, setShortenFailed] = useState(false);
    const [history, setHistory] = useState([]);
    const [isBaseUrl, setIsBaseUrl] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState(null);

    const baseUrl = 'https://api.cloak.li';

    useEffect(() => {
        const savedHistory = JSON.parse(localStorage.getItem('shortenHistory') || '[]');
        setHistory(savedHistory);
    }, []);


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (inputUrl.startsWith(baseUrl)) {
            setIsBaseUrl(true);
            setTimeout(() => {
                setIsBaseUrl(false);
            }, 2000);
            return;
        }


        try {
            const response = await fetch(`${baseUrl}/api/short`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    origUrl: inputUrl,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setShortUrl(data.shortUrl);
                setShortenFailed(false);

                const existingItem = history.find(item => item.origUrl === inputUrl);

                if (!existingItem) {
                    const newHistory = [...history, { origUrl: inputUrl, shortUrl: data.shortUrl, urlId: data.urlId, clicks: 0 }];

                    const recentHistory = newHistory.slice(-10);

                    setHistory(recentHistory);
                    localStorage.setItem('shortenHistory', JSON.stringify(recentHistory));
                } else {
                    return;
                }

            } else {
                setShortenFailed(true);
                setTimeout(() => {
                    setShortenFailed(false);
                }, 2000);
            }

        } catch (error) {
            console.log('An error occurred:', error);
        }
    };



    const updateClicks = async (urlId, index) => {
        if(!urlId) {
            console.log("urlId is undefined");
            return;
        }
        try {
            const response = await fetch(`${baseUrl}/api/clicks/${urlId}`, {
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                const newHistory = [...history];
                newHistory[index] = { ...newHistory[index], clicks: data.clicks };
                setHistory(newHistory);
                localStorage.setItem('shortenHistory', JSON.stringify(newHistory));
            } else {
                console.log('Failed to fetch clicks');
            }
        } catch (error) {
            console.log('An error occurred:', error);
        }
    };



    useEffect(() => {
        const intervalId = setInterval(() => {
            history.forEach((item, index) => {
                updateClicks(item.urlId, index);
            });
        }, 30000);

        return () => clearInterval(intervalId);
    }, [history]);


    const copyToClipboard = () => {
        navigator.clipboard.writeText(shortUrl).then(
            () => {
                setTextCopied(true);
                setTimeout(() => {
                    setTextCopied(false);

                }, 2000);
            },
            (err) => {
                setTextCopied(false)
            }
        );
    };

    const copyHistoryItemToClipboard = (shortUrl, index) => {
        navigator.clipboard.writeText(shortUrl).then(
            () => {
                setCopiedIndex(index);

                setTimeout(() => {
                    setCopiedIndex(null);
                }, 1500);
            },
            (err) => {
                console.error("Could not copy text: ", err);
            }
        );
    };


    const toggleHistory = () => {
        setShowHistory(!showHistory);
    }

    const toggleHistoryIcon = () => {
        return showHistory ? <ChevronDown onClick={toggleHistory} className="self-center ml-2 text-blue-100 hover:text-blue-400 cursor-pointer" size={18} /> : <ChevronRight onClick={toggleHistory} className="self-center ml-2 text-blue-100 hover:text-blue-400 cursor-pointer" size={18} />;
    }

    return (
        <div className="App">
            <div className="flex justify-center items-center mb-10">
                <img src={logo} alt="logo" className="w-[500px]" />
                <h1 className="text-7xl font-bold self-end mb-2">.li</h1>
            </div>

            <form
                className="flex flex-col justify-center items-center my-20"
                onSubmit={handleSubmit}>
                <div>
                    <input
                        className="border-t border-b border-l border-blue-300 rounded-tl rounded-bl p-2 outline-none focus:border-amber-400"
                        type="text"
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                    />
                    <button
                        className="bg-blue-400 hover:bg-blue-500 text-white font-bold py-2 px-4 border-blue-300 border-r border-t border-b rounded-tr rounded-br"
                        type="submit">Shorten</button>
                </div>
                {shortUrl && (
                    <div className="mt-2">
                        <div
                            className="relative bg-blue-400/40 hover:bg-blue-400 hover:text-white cursor-pointer p-3 text-blue-300 border border-blue-300 rounded w-fit mx-auto mt-2"
                            onClick={copyToClipboard}>
                            {shortUrl}
                            {textCopied && (
                                <div className="absolute top-10 -right-3 transition-transform  bg-green-600 text-green-100 border border-green-300 rounded w-fit mx-auto p-0.5">
                                    <p>Copied!</p>
                                </div>
                            )}
                        </div>

                    </div>
                )}
                {shortenFailed && (
                    <div className="bg-red-400/40 text-red-300 border border-red-300 rounded w-fit mx-auto mt-2">
                        <p>Could not get short link. Please try again.</p>
                    </div>
                )}
                {isBaseUrl && (
                    <div className="bg-red-400/40 text-red-300 border border-red-300 rounded w-fit mx-auto mt-2">
                        <p>You cannot shorten the base URL. Please enter a different URL.</p>
                    </div>
                )}
            </form>


            {history.length > 0 && (
                <div className="mt-4">
                    <div className="flex w-full items-center">
                        <h2 className="font-bold uppercase text-start">Link History</h2>
                        {toggleHistoryIcon()}
                    </div>
                    <div className={`flex flex-col transition-all duration-500 ease-in-out ${showHistory ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                        {history.slice().reverse().map((item, index) => (
                            <div key={index} className="flex flex-row justify-between items-center border border-gray-300 rounded p-2 mt-2 w-full">
                                <div className="flex flex-col justify-start text-start w-full">
                                    <div className="text-start w-1/2">
                                        <p className="my-2 text-blue-400 truncate">{item.origUrl}</p>
                                    </div>
                                    <div className="flex">
                                        <a href={item.shortUrl} target="_blank" className="my-2 flex text-blue-300 hover:text-blue-100 transition-all duration-300 ease-in-out">
                                            <span className="text-blue-100 font-semibold mr-2">Short:</span>{item.shortUrl}
                                        </a>
                                        <Copy
                                            onClick={() => copyHistoryItemToClipboard(item.shortUrl, index)}
                                            className="self-center ml-2 text-blue-100 hover:text-blue-400 cursor-pointer"
                                            size={16}
                                        />
                                        {copiedIndex === index && <span className="bg-green-600 text-green-100 border border-green-300 rounded w-fit h-fit ml-2 self-center text-sm">Copied!</span>}
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-gray-400">Clicks: {item.clicks}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;