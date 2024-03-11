import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import Dashboard from "./components/Dashboard"
import { DatoStage, DatoSpeaker, DatoTalk, DatoComplex, DatoBreakoutRoom, DatoLiveStaticElement, DatoMessage, DatoStaff, DatoStream, DashboardElement, SponsorCategory } from "./types"
import useQuery from "./useQuery"
import { iokLocalStorage } from "./utils"

export interface IStore {
	stages: DatoStage[],
	presenters: DatoSpeaker[],
	streams: DatoStream[],
	talks: DatoTalk[],
	breakoutRooms: DatoBreakoutRoom[],
	pageTitle: string, 
	setPageTitle: (title: string) => void,
	registration: RegistrationData|null,
	registrationLoading: boolean,
	registrationError: boolean,
	liveStaticElements: DatoLiveStaticElement
	messages: DatoMessage[]
	staff: DatoStaff[]
	dashboardElements: DashboardElement[]
	sponsorCategories: SponsorCategory[]
}

export const Store = createContext<IStore>({
	stages: [],
	presenters: [],
	talks: [],
	streams: [],
	breakoutRooms: [],
	pageTitle: "IOK 2023",
	setPageTitle: (t: string) => {},
	registration: null,
	registrationLoading: true,
	registrationError: false,
	liveStaticElements: {},
	messages: [],
	staff: [],
	dashboardElements: [],
	sponsorCategories: []
})

type RegistrationData = {
	id: number|null
	name: string
	dato_token: string
	webex_access_token: string|null
	onsite: boolean
	stage: number | null
}

const useRegistrationData = (regId: string|null, regNeeded = true) : [RegistrationData|null, boolean, boolean] => {
	const [registrationData, setRegistrationData] = useState<RegistrationData|null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(false)
	const event = useEvent()

		useEffect(() => {
		(async () => {
			if (regId && String(regId) !== String(JSON.parse(iokLocalStorage("get", "iok_registration_data") as string)?.id)) {
				iokLocalStorage("remove","iok_registration_data")
				const res = await fetch("https://wy8qg2hpoh.execute-api.eu-west-1.amazonaws.com/default/iokRegistrationData?id=" + regId + "&eventId=iok2023")
				const data = await res.json()
				if (data.id) {
					setRegistrationData(data)
					iokLocalStorage("set", "iok_registration_data", JSON.stringify(data))
					window.history.replaceState(null, '', window.location.href.replace(window.location.search, ""))
				} else {
					setError(true)	
				}
			} else if (iokLocalStorage("get", "iok_registration_data")) {
				setRegistrationData(JSON.parse(iokLocalStorage("get", "iok_registration_data") as string))
			} else if (!regNeeded) {
				

				const data = {
					"id": null,
					"name": "Résztvevő",
					"webex_access_token": null,
					"dato_token": "5b4d0c68817732d4ac571d61e85fd7", // LiveVisitor token, EducationNext2022
					//"dato_token": "86562f6d25113edf16c2608cedf976", // LiveVisitor token, IOK2022	
					"stage": null,
					"onsite": false
				}
				setRegistrationData(data)
				iokLocalStorage("set", "iok_registration_data", JSON.stringify(data))
				window.history.replaceState(null, '', window.location.href.replace(window.location.search, ""))
			}
			setLoading(false)
		})()
	}, [regId])

	return [registrationData, loading, error]
}

export const StoreProvider = (props: { children: React.ReactElement }) => {
	const [data] = useQuery<DatoComplex>(`
		{
			allStages(orderBy: [order_ASC]) {
				id
				name
				pageTitle
				slug
				staticVideo {
					url
					name
				}
				streams {
					id
					name
					youtubeVideoId
					live
					language {
						id
						name
						slug
						image {
							url
						}
						recordingLabel
						liveLabel
					}
				}
				schedule {
					id
					title
					start
					description
					recordings {
						id
						name
						youtubeVideoId
						language {
							id
							name
							slug
							playRecordingText
							image {
								url
							}
						}
					}
					presentation {
						url
					}
					speaker {
						id
					}
				}
			}
			allBreakoutrooms {
				description {
				  value
				}
				title
				roomId
				enabled
			}
			allSponsorCategories(first: 100 ) {
                name
                sponsor {
                    name
                    url
                    logo {
                    url
                    }
                }
            }
			liveStaticElement {
				welcome {
				  value
				}
				httpCsapat {
					value
				}
				iokCafe {
					value
				}
				iokCafeInfo {
					value
				}
				iokCafeHandout {
					value
				}
				httpMemberPlus {
					value
				}
				staff {
					value
				}
				junior {
					value
				}
				media {
					value
				}
				sessionLead {
					value
				}
				rating {
					value
				}
				menu {
					value
				}
				handout {
					value
				}
				menuImage {
					url
				}
				streamNotLive {
					value
				}
				galleryUrl
				presidentStaffId		
			}
			allSpeakers(first: 100) {
				id
				name
				title
				company
				slug
				bio
				image {
					url
				}
			}
			allMessages(first: 100) {
				id
				createdAt
				title
				message {
					value
				}
				level
				staff {
					name
					image {
						url
					}
				}
			}
			allStaffs {
				id
				name
				title
				company
				image {
				  url
				}
				group
				slug
			}
			allStreams(first: 100) {
				id
				name
				youtubeVideoId
				live
				recording
				language {
					id
					name
					slug
					image {
						url
					}
					playRecordingText
				}
			}
			allDashboardElements {
				light
				link
				mobileOrder
				title
				caption
				corner
				hoverImg {
				  url
				}
				img {
				  url
				}
				enabled
				dashboardType
			  }
	  	}
	`, {
		allStages: [], 
		allBreakoutrooms: [], 
		liveStaticElement: {}, 
		allSpeakers: [], 
		allMessages: [], 
		allStaffs: [], 
		allStreams: [], 
		allDashboardElements: [],
		allSponsorCategories: []
	})
	const {
		allStages : stages, 
		allStreams: streams, 
		allBreakoutrooms: breakoutRooms, 
		liveStaticElement: liveStaticElements, 
		allSpeakers: presenters, 
		allMessages: messages, 
		allStaffs: staff,
		allDashboardElements: dashboardElements,
		allSponsorCategories: sponsorCategories
	} 	= data

	const talks = useMemo(() => {
		const talks: DatoTalk[] = []
		stages.forEach(stage => {
			const stageTalks = stage?.schedule?.map(talk => ({
				...talk,
				stage: {
					...stage,
					schedule: undefined
				}
			})) ?? []
			talks.push(...stageTalks)
		})
		return talks
	}, [stages])

	const [pageTitle, setPageTitle] = useState("IOK 2023")

	const regId = (new URLSearchParams(window.location.search)).get('q') || null
	const [registration, registrationLoading, registrationError] = useRegistrationData(regId, false) // TODO: lambdaból jöjjön

	const store:IStore = useMemo(() => ({
		stages,
		presenters,
		talks,
		streams,
		breakoutRooms,
		pageTitle,
		setPageTitle,
		registration,
		registrationLoading,
		registrationError,
		liveStaticElements,
		messages,
		staff,
		dashboardElements,
		sponsorCategories
	}), [
			stages, 
			presenters, 
			talks, 
			breakoutRooms, 
			pageTitle, 
			setPageTitle, 
			registration, 
			registrationLoading, 
			registrationError, 
			liveStaticElements, 
			messages, 
			staff,
			streams,
			dashboardElements,
			sponsorCategories
		]
	)

	return <Store.Provider value={store}>{props.children}</Store.Provider>
}

export const useStore = () => {
	const store = useContext(Store)
	return store
}

export const usePresenterWithTalksByStage = (presenterSlug: string|null) => {

	const store = useStore()

	const stages = store.stages
	const presenter = useMemo(() => store.presenters.find(p => p.slug === presenterSlug), [presenterSlug, store.presenters])

	const talksByStage = useMemo(() => 
		stages.map(stage => (
			{...stage, schedule: stage.schedule?.filter(talk => talk.speaker.filter(speaker => speaker.id === presenter?.id).length)}
		)).filter(stage => stage.schedule?.length)
	, [stages, presenter?.id])


	return useMemo(() => ({...presenter, talksByStage}), [presenter, talksByStage])
}

export const usePresenters = () => {
	const store = useStore()
	return store.presenters
}


export const useStages = () => {
	const store = useStore()
	return store.stages
}

export const useLiveStaticElements = () => {
	const store = useStore()
	return store.liveStaticElements
}

export const usePresident = () => {
	const store = useStore()
	const staff = store.staff
	const presidentStaffId = store.liveStaticElements.presidentStaffId
	return staff.find((staffMember) => staffMember.id == presidentStaffId)
}

export const useStage = (stageSlug?: string) => {
	const store = useStore()
	const index = store.stages.findIndex(stage => stage.slug === stageSlug)
	return {...store.stages[index], prevStage: index > 0 ? store.stages[index - 1] : null, nextStage: index < store.stages.length - 1 ? store.stages[index + 1] : null}
}

export const useBreakoutRooms = (stageSlug?: string) => {
	const store = useStore()
	return store.breakoutRooms
}

export const useStaff = (group?: string) => {
	const store = useStore()
	if (group) return store.staff.filter(member => member.group===group)
	return store.staff
}

export const useSponsorCategories = () => {
	const store = useStore()
	return store.sponsorCategories
}

export const useTalk = (talkId?: string|number) => {
	const store = useStore()

	const talk = useMemo(() => store.talks.find(t => String(t.id) === String(talkId)), [talkId, store.talks])
	const speakerIds = useMemo(() => talk?.speaker?.map(s => s.id), [talk?.speaker])
	const speakers = useMemo(() => store.presenters.filter(p => speakerIds?.includes(p.id)), [store.presenters, speakerIds])

	return useMemo(() => ({...talk, speakers}), [talk, speakers])
}
export const useSetPageTitle = () => {
	const store = useStore()
	return store.setPageTitle
}

export const usePageTitle = () => {
	const store = useStore()
	return store.pageTitle
}

export const useRegistration = (): [RegistrationData|null, boolean, boolean] => {
	const store = useStore()
	return [store.registration, store.registrationLoading, store.registrationError]
}

export const useMessages = () => {
	const store = useStore()
	return store.messages
}

export const useStreams = () => {
	const store = useStore()
	return store.streams
}

export const useEvent = () => {
	return process.env.EVENT
}

export const useDashboardElements = (type: string) => {
	const store = useStore()
	const dashboardElements = store.dashboardElements.filter(element => element.dashboardType === type )
	return dashboardElements	
}


export default Store