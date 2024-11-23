import { Dispatch, SetStateAction } from 'react'
import StateModel from './StateModel'

export default interface GlobalStateModel {
	state: StateModel
	setState: Dispatch<SetStateAction<StateModel>>
}
