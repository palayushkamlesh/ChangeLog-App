import { useEffect, useState } from "react";
import api from "../api";
import { Link, useNavigate } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();

  const [changelogs, setChangelogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================================
  // Fetch all changelogs
  // ================================
  const fetchChangelogs = async () => {
    try {
      const response = await api.get(
        "/changelogs/admin/all"
      );

      setChangelogs(response.data);
    } catch (error) {
      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChangelogs();
  }, []);

  // ================================
  // Publish update
  // ================================
  const publishUpdate = async (id) => {
    try {
      await api.patch(
        `/changelogs/admin/${id}/publish`
      );

      fetchChangelogs();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to publish"
      );
    }
  };

  // ================================
  // Delete update
  // ================================
  const deleteUpdate = async (id) => {
    const confirmed = window.confirm(
      "Delete this update?"
    );

    if (!confirmed) return;

    try {
      await api.delete(
        `/changelogs/admin/${id}`
      );

      fetchChangelogs();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to delete"
      );
    }
  };

  // ================================
  // Logout
  // ================================
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      navigate("/login");
    }
  };

  return (
    <div className="admin-page">

      {/* ================================
          HEADER
      ================================= */}

      <header className="admin-header">

        <div>
          <div className="admin-logo">
            Changelog
          </div>

          <span className="admin-label">
            Admin Dashboard
          </span>
        </div>

        <div className="admin-actions">

          <Link
            to="/"
            className="secondary-button"
          >
            View Changelog
          </Link>

          <button
            onClick={logout}
            className="logout-button"
          >
            Logout
          </button>

        </div>

      </header>


      {/* ================================
          MAIN
      ================================= */}

      <main className="admin-container">

        <div className="dashboard-title">

          <div>

            <p className="eyebrow">
              CONTENT MANAGEMENT
            </p>

            <h1>
              Product Updates
            </h1>

            <p>
              Create and manage your changelog posts.
            </p>

          </div>

          <Link
            to="/admin/create"
            className="primary-button"
          >
            + Create Update
          </Link>

        </div>


        {/* ================================
            LOADING
        ================================= */}

        {loading ? (

          <div className="empty">
            Loading updates...
          </div>


        ) : changelogs.length === 0 ? (

          /* ================================
             EMPTY STATE
          ================================= */

          <div className="empty">

            <h2>
              No updates yet
            </h2>

            <p>
              Create your first product update.
            </p>

            <Link
              to="/admin/create"
              className="primary-button"
            >
              Create Update
            </Link>

          </div>


        ) : (

          /* ================================
             CHANGELOG LIST
          ================================= */

          <div className="admin-list">

            {changelogs.map((item) => (

              <div
                className="admin-item"
                key={item._id}
              >

                <div className="admin-item-content">

                  <div className="update-meta">

                    <span className="category">
                      #{item.category}
                    </span>

                    <span
                      className={
                        item.status === "Published"
                          ? "status published"
                          : "status draft"
                      }
                    >
                      {item.status}
                    </span>

                  </div>

                  <h2>
                    {item.title}
                  </h2>

                  <p>
                    Created{" "}
                    {new Date(
                      item.createdAt
                    ).toLocaleDateString()}
                  </p>

                </div>


                {/* ================================
                    ACTIONS
                ================================= */}

                <div className="admin-item-actions">

                    <Link
                      to={`/admin/edit/${item._id}`}
                      className="edit-button"
                    >
                      Edit
                    </Link>

                    {item.status === "Draft" && (
                      <button
                        onClick={() =>
                          publishUpdate(item._id)
                        }
                        className="publish-button"
                      >
                        Publish
                      </button>
            )}
            
  <button
    onClick={() =>
      deleteUpdate(item._id)
    }
    className="delete-button"
  >
    Delete
  </button>

</div>

              </div>

            ))}

          </div>

        )}

      </main>

    </div>
  );
}

export default AdminDashboard;