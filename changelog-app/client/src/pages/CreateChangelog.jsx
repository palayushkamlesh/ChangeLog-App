import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import api from "../api";

function CreateChangelog() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditMode = Boolean(id);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("New");
  const [contentMarkdown, setContentMarkdown] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [status, setStatus] = useState("Draft");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ================================
  // Load existing changelog
  // Edit mode only
  // ================================
  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    const fetchChangelog = async () => {
      try {
        setLoading(true);

        const response = await api.get(
          "/changelogs/admin/all"
        );

        const changelog = response.data.find(
          (item) => item._id === id
        );

        if (!changelog) {
          setError("Changelog not found");
          return;
        }

        setTitle(changelog.title || "");
        setCategory(
          changelog.category || "New"
        );
        setContentMarkdown(
          changelog.contentMarkdown || ""
        );
        setCoverImage(
          changelog.coverImage || ""
        );
        setStatus(
          changelog.status || "Draft"
        );
      } catch (error) {
        if (
          error.response?.status === 401 ||
          error.response?.status === 403
        ) {
          navigate("/login");
          return;
        }

        setError(
          error.response?.data?.message ||
            "Failed to load update"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchChangelog();
  }, [id, isEditMode, navigate]);

  // ================================
  // Create / Update
  // ================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSaving(true);

    try {
      const data = {
        title,
        category,
        contentMarkdown,
        coverImage,
        status,
      };

      if (isEditMode) {
        await api.put(
          `/changelogs/admin/${id}`,
          data
        );
      } else {
        await api.post(
          "/changelogs/admin",
          data
        );
      }

      navigate("/admin");
    } catch (error) {
      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        navigate("/login");
        return;
      }

      setError(
        error.response?.data?.message ||
          (
            isEditMode
              ? "Failed to update"
              : "Failed to create update"
          )
      );
    } finally {
      setSaving(false);
    }
  };

  // ================================
  // Loading state
  // ================================
  if (loading) {
    return (
      <div className="create-page">

        <header className="admin-header">

          <div>
            <div className="admin-logo">
              Changelog
            </div>

            <span className="admin-label">
              Edit Product Update
            </span>
          </div>

        </header>

        <main className="create-container">

          <div className="empty">
            Loading update...
          </div>

        </main>

      </div>
    );
  }

  return (
    <div className="create-page">

      {/* ================================
          HEADER
      ================================= */}

      <header className="admin-header">

        <div>

          <div className="admin-logo">
            Changelog
          </div>

          <span className="admin-label">
            {isEditMode
              ? "Edit Product Update"
              : "Create Product Update"}
          </span>

        </div>

        <Link
          to="/admin"
          className="secondary-button"
        >
          ← Back
        </Link>

      </header>


      {/* ================================
          MAIN
      ================================= */}

      <main className="create-container">

        <div className="create-title">

          <p className="eyebrow">
            MARKDOWN STUDIO
          </p>

          <h1>
            {isEditMode
              ? "Edit Update"
              : "Create Update"}
          </h1>

          <p>
            {isEditMode
              ? "Update your product announcement and save your changes."
              : "Write your product update and preview it live."}
          </p>

        </div>


        {/* ERROR */}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}


        {/* ================================
            FORM
        ================================= */}

        <form
          className="editor-form"
          onSubmit={handleSubmit}
        >

          {/* ================================
              SETTINGS
          ================================= */}

          <div className="editor-settings">

            {/* Title */}

            <div className="field">

              <label>
                Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                placeholder="Version 2.0 is here"
                required
              />

            </div>


            {/* Category */}

            <div className="field">

              <label>
                Category
              </label>

              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
              >

                <option value="New">
                  #New
                </option>

                <option value="Improved">
                  #Improved
                </option>

                <option value="Fixed">
                  #Fixed
                </option>

              </select>

            </div>


            {/* Cover Image */}

            <div className="field">

             <label>Cover Image</label>

                <input
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://example.com/cover-image.jpg"
                />

<small className="field-hint">
  Add an image URL for the changelog cover.
</small>

            </div>


            {/* Status */}

            <div className="field">

              <label>
                Status
              </label>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value)
                }
              >

                <option value="Draft">
                  Draft
                </option>

                <option value="Published">
                  Published
                </option>

              </select>

            </div>

          </div>


          {/* ================================
              EDITOR + PREVIEW
          ================================= */}

          <div className="editor-grid">

            {/* Markdown */}

            <div className="editor-panel">

              <div className="panel-header">
                Markdown
              </div>

              <textarea
                value={contentMarkdown}
                onChange={(e) =>
                  setContentMarkdown(
                    e.target.value
                  )
                }
                placeholder={`# What's new?

We are excited to announce our latest update.

## New Features

- New dashboard
- Faster search
- Better notifications

**Thank you for using our product!**`}
                required
              />

            </div>


            {/* Preview */}

            <div className="preview-panel">

              <div className="panel-header">
                Live Preview
              </div>

              <div className="preview-content">

                {title && (
                  <h1>
                    {title}
                  </h1>
                )}

                <ReactMarkdown>
                  {contentMarkdown ||
                    "Your Markdown preview will appear here..."}
                </ReactMarkdown>

              </div>

            </div>

          </div>


          {/* ================================
              ACTIONS
          ================================= */}

          <div className="form-actions">

            <Link
              to="/admin"
              className="secondary-button"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : isEditMode
                ? "Save Changes"
                : status === "Published"
                ? "Publish Update"
                : "Save Draft"}
            </button>

          </div>

        </form>

      </main>

    </div>
  );
}

export default CreateChangelog;