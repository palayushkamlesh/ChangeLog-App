import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";

import api from "../api";
import NotificationBell from "../components/NotificationBell";

function Home() {
  const [changelogs, setChangelogs] = useState([]);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  // ================================
  // Fetch public changelogs
  // ================================
  const fetchChangelogs = async () => {
    try {
      const response = await api.get("/changelogs", {
        params: {
          category,
          search,
        },
      });

      setChangelogs(response.data);
    } catch (error) {
      console.error(
        "Failed to fetch changelogs:",
        error
      );
    }
  };

  // ================================
  // Handle reaction
  // ================================
  const handleReaction = async (id, type) => {
    try {
      await api.post(
        `/changelogs/${id}/reaction`,
        {
          type,
        }
      );

      fetchChangelogs();
    } catch (error) {
      if (error.response?.status === 401) {
        alert(
          "Please login to react to an update."
        );
      } else {
        console.error(
          "Reaction failed:",
          error
        );
      }
    }
  };

  // ================================
  // Get reaction count
  // ================================
  const getReactionCount = (item, type) => {
    const reaction = item.reactions?.find(
      (reaction) =>
        reaction._id === type
    );

    return reaction
      ? reaction.count
      : 0;
  };

  // ================================
  // Search / filter
  // ================================
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchChangelogs();
    }, 300);

    return () => clearTimeout(timer);
  }, [category, search]);

  return (
    <div className="app">

      {/* ================================
          NAVBAR
      ================================= */}

      <header className="navbar">

        <div className="logo">
          Changelog
        </div>

        <div className="nav-right">

          <Link to="/login">
            Admin Login
          </Link>

          <NotificationBell />

        </div>

      </header>


      {/* ================================
          MAIN
      ================================= */}

      <main className="container">

        {/* HERO */}

        <section className="hero">

          <p className="eyebrow">
            PRODUCT UPDATES
          </p>

          <h1>
            What's new?
          </h1>

          <p>
            Stay updated with the latest
            improvements, features and fixes.
          </p>

        </section>


        {/* ================================
            FILTER + SEARCH
        ================================= */}

        <div className="toolbar">

          <div className="filters">

            {[
              "All",
              "New",
              "Improved",
              "Fixed",
            ].map((item) => (

              <button
                key={item}
                className={
                  category === item
                    ? "filter active"
                    : "filter"
                }
                onClick={() =>
                  setCategory(item)
                }
              >
                {item}
              </button>

            ))}

          </div>


          <input
            type="text"
            placeholder="Search updates..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>


        {/* ================================
            TIMELINE
        ================================= */}

        <section className="timeline">

          {changelogs.length === 0 ? (

            <div className="empty">

              <h2>
                No updates yet
              </h2>

              <p>
                Published product updates
                will appear here.
              </p>

            </div>

          ) : (

            changelogs.map((item) => (

              <article
                className="update-card"
                key={item._id}
              >

                {/* META */}

                <div className="update-meta">

                  <span className="date">

                    {item.publishedAt
                      ? new Date(
                          item.publishedAt
                        ).toLocaleDateString()
                      : ""}

                  </span>

                  <span
                    className={`category ${item.category.toLowerCase()}`}
                  >
                    #{item.category}
                  </span>

                </div>


                {/* TITLE */}

                <h2>
                  {item.title}
                </h2>


                {/* COVER IMAGE */}

                {item.coverImage && (

                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="cover"
                  />

                )}


                {/* MARKDOWN */}

                <div className="markdown">

                  <ReactMarkdown>
                    {item.contentMarkdown}
                  </ReactMarkdown>

                </div>


                {/* ================================
                    REACTIONS
                ================================= */}

                <div className="reactions">

                  <button
                    onClick={() =>
                      handleReaction(
                        item._id,
                        "heart"
                      )
                    }
                    title="Love this update"
                  >
                    ❤️

                    <span>
                      {getReactionCount(
                        item,
                        "heart"
                      )}
                    </span>

                  </button>


                  <button
                    onClick={() =>
                      handleReaction(
                        item._id,
                        "party"
                      )
                    }
                    title="Celebrate"
                  >
                    🎉

                    <span>
                      {getReactionCount(
                        item,
                        "party"
                      )}
                    </span>

                  </button>


                  <button
                    onClick={() =>
                      handleReaction(
                        item._id,
                        "rocket"
                      )
                    }
                    title="Awesome"
                  >
                    🚀

                    <span>
                      {getReactionCount(
                        item,
                        "rocket"
                      )}
                    </span>

                  </button>

                </div>

              </article>

            ))

          )}

        </section>

      </main>

    </div>
  );
}

export default Home;