import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import initializeFirebase from '../firebase';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

type Notification = {
  id: string;
  message: string;
  read: boolean;
};

const NotificationSystem: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [db,setDb]=useState<any>(null)

  useEffect(() => {
    
    const initialize = async () => {
      try {
        const { db } = await initializeFirebase();
        setDb(db);
      } catch (error) {
        console.error('Error initializing Firebase:', error);
      }
    };

    initialize();
  }, [db]);
  const sendNotification = async (message: string) => {
    try {
      await addDoc(collection(db, 'notifications'), {
        message,
        read: false
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const q = query(collection(db, 'notifications'), where('read', '==', false));
      const querySnapshot = await getDocs(q);
      const fetchedNotifications: Notification[] = [];
      querySnapshot.forEach((doc) => {
        fetchedNotifications.push({ id: doc.id, ...doc.data() } as Notification);
      });
      setNotifications(fetchedNotifications);
      setUnreadCount(fetchedNotifications.length);
    } catch (error) {
      console.error('Error fetching documents: ', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const notificationDoc = doc(db, 'notifications', id);
      await updateDoc(notificationDoc, { read: true });
      fetchNotifications();
    } catch (error) {
      console.error('Error updating document: ', error);
    }
  };

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    fetchNotifications();
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Card sx={{ width: 400, height: 400, position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <IconButton
          color="inherit"
          onClick={handleNotificationClick}
          sx={{ position: 'absolute', top: 16, right: 16 }}
        >
          <Badge badgeContent={unreadCount} color="secondary">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <CardContent sx={{ textAlign: 'center' }}>
          <Typography variant="h5" component="div" gutterBottom>
            Notification System
          </Typography>
          <div style={{gap:"10px"}}>
            <div style={{margin:"10px"}}>
              <Button variant="outlined"  onClick={() => sendNotification('Notification 1')}>Send Notification 1</Button>
            </div>
            <div style={{margin:"10px"}}>
              <Button variant="outlined" onClick={() => sendNotification('Notification 2')}>Send Notification 2</Button>
            </div>
            <div style={{margin:"10px"}}>
              <Button variant="outlined" onClick={() => sendNotification('Notification 3')}>Send Notification 3</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {notifications.length === 0 ? (
          <MenuItem onClick={handleMenuClose}>No new notifications</MenuItem>
        ) : (
          notifications.map((notification) => (
            <MenuItem key={notification.id}>
              <Box sx={{ flexGrow: 1 }}>{notification.message}</Box>
              <Button style={{marginLeft:"5px"}} variant="outlined" onClick={() => markAsRead(notification.id)}>Mark as read</Button>
            </MenuItem>
          ))
        )}
      </Menu>
    </div>
  );
};

export default NotificationSystem;
