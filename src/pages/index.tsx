import { useEffect } from 'react'
import { Form } from '@/components/form'
import { Introduction } from '@/components/introduction'
import { Menu } from '@/components/menu'
import { Meta } from '@/components/meta'
import ModalImage from '@/components/modalImage'
import VrmViewer from '@/components/vrmViewer'
import homeStore from '@/features/stores/home'
import '@/lib/i18n'
import { buildUrl } from '@/utils/buildUrl'
import { useLocation } from '@/features/location/locationService'

const Home = () => {
  const bgUrl = homeStore((s) => `url(${buildUrl(s.backgroundImageUrl)})`)
  const location = useLocation()

  useEffect(() => {
    if (location) {
      console.log("位置情報が取得されました:", location)
    } else {
      console.log("位置情報はまだ取得されていません")
    }
  }, [location])

  useEffect(() => {
    // 位置情報をhomeStoreに保存
    if (location) {
      homeStore.setState({ userLocation: location })
    }
  }, [location])

  return (
    <div className="min-h-screen bg-cover" style={{ backgroundImage: bgUrl }}>
      <Meta />
      <Introduction />
      <VrmViewer />
      <Form />
      <Menu />
      <ModalImage />
    </div>
  )
}

export default Home