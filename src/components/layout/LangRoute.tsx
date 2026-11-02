import { Navigate, useParams } from 'react-router-dom'
import { I18nProvider, DEFAULT_LANG, isLang } from '../../i18n'
import { browserLang } from '../../i18n/detect'
import { store } from '../../i18n/storage'
import Home from '../../pages/Home'
import NotFound from '../../pages/NotFound'

export function RootRedirect() {
  // explicit > saved > browser language > English. Country is only ever a (dismissable) suggestion.
  const saved = store.get('lang')
  const target = isLang(saved) ? saved : browserLang() ?? DEFAULT_LANG
  return <Navigate to={`/${target}/${window.location.hash}`} replace />
}

export default function LangRoute() {
  const { lang } = useParams()
  if (!isLang(lang)) return <NotFound />
  return <I18nProvider lang={lang}><Home /></I18nProvider>
}
