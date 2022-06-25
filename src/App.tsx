import { QuestionMarkCircleIcon } from '@heroicons/react/outline'
import { MenuAlt2Icon } from '@heroicons/react/outline'
import { useState, useEffect } from 'react'
import { Alert } from './components/alerts/Alert'
import { Grid } from './components/grid/Grid'
import { Keyboard } from './components/keyboard/Keyboard'
import { AboutModal } from './components/modals/AboutModal'
import { InfoModal } from './components/modals/InfoModal'
import { WinModal } from './components/modals/WinModal'
import { StatsModal } from './components/modals/StatsModal'
import { isWordInWordList, isWinningWord, solution } from './lib/words'
import { addStatsForCompletedGame, loadStats } from './lib/stats'
import {
  loadGameStateFromLocalStorage,
  loadThemeFromLocalStorage,
  saveGameStateToLocalStorage,
  saveThemeToLocalStorage,
} from './lib/localStorage'

import { Theme } from './types/theme'

import ReactGA from 'react-ga'
import Token from './components/constants/reactGAToken'
import DarkModeToggle from './components/darkModeToggle'

function App() {
  const [theme, setTheme] = useState<Theme>('light')
  const [currentGuess, setCurrentGuess] = useState('')
  const [isGameWon, setIsGameWon] = useState(false)
  const [isWinModalOpen, setIsWinModalOpen] = useState(false)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false)
  const [isNotEnoughLetters, setIsNotEnoughLetters] = useState(false)
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false)
  const [isWordNotFoundAlertOpen, setIsWordNotFoundAlertOpen] = useState(false)
  const [isGameLost, setIsGameLost] = useState(false)
  const [shareComplete, setShareComplete] = useState(false)
  const [guesses, setGuesses] = useState<string[]>(() => {
    const loaded = loadGameStateFromLocalStorage()
    if (loaded?.solution !== solution) {
      return []
    }
    if (loaded.guesses.includes(solution)) {
      setIsGameWon(true)
    }
    return loaded.guesses
  })

  const [stats, setStats] = useState(() => loadStats())

  useEffect(() => {
    setTheme(loadThemeFromLocalStorage())
  }, [])

  useEffect(() => {
    saveThemeToLocalStorage(theme)
  }, [theme])

  useEffect(() => {
    saveGameStateToLocalStorage({ guesses, solution })
  }, [guesses])

  useEffect(() => {
    if (isGameWon) {
      setIsWinModalOpen(true)
    }
  }, [isGameWon])

  const onChar = (value: string) => {
    if (currentGuess.length < 5 && guesses.length < 6 && !isGameWon) {
      setCurrentGuess(`${currentGuess}${value}`)
    }
  }

  const onDelete = () => {
    setCurrentGuess(currentGuess.slice(0, -1))
  }

  const onEnter = () => {
    if (!(currentGuess.length === 5)) {
      setIsNotEnoughLetters(true)
      return setTimeout(() => {
        setIsNotEnoughLetters(false)
      }, 3000)
    }

    if (!isWordInWordList(currentGuess)) {
      setIsWordNotFoundAlertOpen(true)
      return setTimeout(() => {
        setIsWordNotFoundAlertOpen(false)
      }, 3000)
    }

    const winningWord = isWinningWord(currentGuess)

    if (currentGuess.length === 5 && guesses.length < 6 && !isGameWon) {
      setGuesses([...guesses, currentGuess])
      setCurrentGuess('')

      if (winningWord) {
        setStats(addStatsForCompletedGame(stats, guesses.length))
        return setIsGameWon(true)
      }

      if (guesses.length === 5) {
        setStats(addStatsForCompletedGame(stats, guesses.length + 1))
        setIsGameLost(true)
        return setTimeout(() => {
          setIsGameLost(false)
        }, 5000)
      }
    }
  }
  useEffect(() => {
    ReactGA.initialize(Token)
    ReactGA.pageview('/')
  }, [])

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="h-screen w-screen dark:bg-custom-black">
        <div className="py-5 max-w-7xl mx-auto sm:px-6 lg:px-8">
          <Alert
            message="کلمه وارد شده کوتاه تر از حد انتظار است"
            isOpen={isNotEnoughLetters}
          />
          <Alert
            message="کلمه وارد شده صحیح نیست"
            isOpen={isWordNotFoundAlertOpen}
          />
          <Alert
            message={`بنظر میرسه شما باختید💔 کلمه مورد نظر : ${solution}`}
            isOpen={isGameLost}
          />
          <Alert
            message="نتیجه بازی در کلیپ بورد کپی شد می تونی الان توییتش کنی 😃"
            isOpen={shareComplete}
            variant="success"
          />
          <div className="flex w-72 mx-auto items-center mb-8 dark:text-white">
            <DarkModeToggle theme={theme} setTheme={setTheme} />
            <QuestionMarkCircleIcon
              className="h-6 w-6 cursor-pointer animate-pulse"
              onClick={() => setIsInfoModalOpen(true)}
            />
            <h1 className="text-xl grow font-light text-center dark:text-white">
              وردل ، اما با کلمات فارسی
            </h1>
            <MenuAlt2Icon
              className="h-6 w-6 cursor-pointer -rotate-180"
              onClick={() => setIsStatsModalOpen(true)}
            />
          </div>
          <Grid guesses={guesses} currentGuess={currentGuess} />
          <Keyboard
            onChar={onChar}
            onDelete={onDelete}
            onEnter={onEnter}
            guesses={guesses}
          />
          <WinModal
            isOpen={isWinModalOpen}
            handleClose={() => setIsWinModalOpen(false)}
            guesses={guesses}
            theme={theme}
            handleShare={() => {
              setIsWinModalOpen(false)
              setShareComplete(true)
              return setTimeout(() => {
                setShareComplete(false)
              }, 5000)
            }}
          />
          <InfoModal
            isOpen={isInfoModalOpen}
            handleClose={() => setIsInfoModalOpen(false)}
            theme={theme}
          />
          <StatsModal
            isOpen={isStatsModalOpen}
            handleClose={() => setIsStatsModalOpen(false)}
            gameStats={stats}
            theme={theme}
          />
          <AboutModal
            isOpen={isAboutModalOpen}
            handleClose={() => setIsAboutModalOpen(false)}
            theme={theme}
          />

          <button
            type="button"
            className="mx-auto mt-10 flex items-center px-2.5 py-1.5 text-xs font-medium rounded text-indigo-700 bg-white focus:outline-none dark:bg-transparent dark:text-slate-200"
            onClick={() => setIsAboutModalOpen(true)}
          >
            درباره وردل فارسی
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
