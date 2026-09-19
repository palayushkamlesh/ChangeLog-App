import { useEffect, useState } from "react";
import api from "../api";

function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get("/notifications/unread-count");
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error("Failed to fetch unread count");
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const response = await api.get("/notifications");

      setNotifications(response.data);
    } catch (error) {
      console.error("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  const openNotifications = async () => {
    setOpen(true);

    await fetchNotifications();

    // Opening the notification drawer means
    // the user has viewed the current changelog.
    try {
      await api.patch("/notifications/read-all");

      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark notifications as read");
    }
  };

  const closeNotifications = () => {
    setOpen(false);
  };

  const handleToggle = () => {
    if (open) {
      closeNotifications();
    } else {
      openNotifications();
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  return (
    <div className="notification-wrapper">
      <button
        className="bell"
        onClick={handleToggle}
        aria-label="Notifications"
      >
        🔔

        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notification-panel">
          <div className="notification-header">
            <div>
              <h3>Notifications</h3>
              <span>
                {unreadCount > 0
                  ? `${unreadCount} unread`
                  : "All caught up"}
              </span>
            </div>

            <button
              className="notification-close"
              onClick={closeNotifications}
            >
              ×
            </button>
          </div>

          <div className="notification-list">
            {loading ? (
              <div className="notification-empty">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty">
                <div className="notification-empty-icon">
                  🔔
                </div>

                <p>No notifications yet</p>

                <span>
                  You'll see new product updates here.
                </span>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`notification-item ${
                    notification.read ? "" : "unread"
                  }`}
                >
                  <div className="notification-dot">
                    {!notification.read && <span />}
                  </div>

                  <div className="notification-content">
                    <h4>
                      {notification.title}
                    </h4>

                    <p>
                      {notification.message}
                    </p>

                    {notification.changelogId && (
                      <small>
                        Product update
                      </small>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="notification-footer">
              <button
                onClick={async () => {
                  try {
                    await api.patch(
                      "/notifications/read-all"
                    );

                    setNotifications((previous) =>
                      previous.map((notification) => ({
                        ...notification,
                        read: true,
                      }))
                    );

                    setUnreadCount(0);
                  } catch (error) {
                    console.error(
                      "Failed to mark all notifications as read"
                    );
                  }
                }}
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;