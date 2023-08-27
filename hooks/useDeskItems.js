import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setDeskItems } from '../redux/actions/desk';
import { deskItemsListener } from '../services/desk';

export const useDeskItems = (id) => {
    const dispatch = useDispatch();
    const currentUser = useSelector(state => state.userState.currentUser);
    const [deskItems, setDeskItems] = useState([])
    const users = useSelector(state => state.usersState.users);
    const handleDeskItemsChange = useCallback(
        (change, users) => {
            setDeskItems(change.docs.map(item => {
                const user = users.find(user => user.uid == item.data().uid);
                return { id: item.id, user, ...item.data() }
            }))
        },
        [dispatch],
    )

    useEffect(() => {
        let listener;

        if (currentUser) {
            listener = deskItemsListener((snapshot) => handleDeskItemsChange(snapshot, users), id);
        }

        return () => {
            listener && listener();
        }
    }, [handleDeskItemsChange, currentUser, users])
    return { deskItems }
}

