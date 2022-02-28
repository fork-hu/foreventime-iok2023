import { WebexMeetingsWidget } from '@webex/widgets'
import '@webex/widgets/dist/css/webex-widgets.css'



export const WebexWidget = () => {
	return (
		<WebexMeetingsWidget
			style={{width: "100%", height: "100%"}}
			accessToken="MmQ3NWZkOTgtYzcxZS00NWVmLWE2ZmEtYWZiZDNhNjEwMWZjYWE0MDAxNDgtODU4_PF84_4a05e5c1-65cb-4f86-899f-dbcc12a1af24"
			meetingDestination="zoltan.sisak@httpf.webex.com"
		/>
	)
}

export default WebexWidget