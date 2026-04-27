import React, { useCallback, useEffect, useRef, useState } from "react";
import { userService } from "../services/userService";
import "./Profile.css";
import fatPigeon from "../../../assets/fat_pigeon.png";
import healthyPigeon from "../../../assets/healthy_pigeon.png";
import superHealthyPigeon from "../../../assets/super_healthy_pigeon.png";

const TIMEFRAME_OPTIONS = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
];

const CHART_WIDTH = 560;
const CHART_HEIGHT = 240;
const CHART_PADDING = 24;
const RECENT_ACTIVITY_PAGE_SIZE = 5;
const CHART_EXPORT_STYLES = `
  .progress-chart {
    display: block;
    background: linear-gradient(180deg, rgba(138, 63, 252, 0.08), rgba(138, 63, 252, 0.02)), white;
    border-radius: 14px;
    border: 1px solid rgba(138, 63, 252, 0.12);
  }
  .chart-axis {
    stroke: rgba(90, 30, 194, 0.35);
    stroke-width: 2;
  }
  .chart-line {
    stroke: #8a3ffc;
    stroke-width: 4;
    stroke-linecap: round;
    stroke-linejoin: round;
    fill: none;
  }
  .chart-guide {
    stroke: rgba(138, 63, 252, 0.15);
    stroke-width: 2;
  }
  .chart-point {
    fill: white;
    stroke: #8a3ffc;
    stroke-width: 3;
  }
  .chart-point.active {
    fill: #8a3ffc;
  }
`;

const buildChartGeometry = (data) => {
  if (!data.length) {
    return { positions: [], polylinePoints: "" };
  }

  const maxValue = Math.max(...data.map((item) => item.cumulative_points), 0);
  const minValue = Math.min(...data.map((item) => item.cumulative_points), 0);
  const range = maxValue - minValue || 1;
  const usableWidth = CHART_WIDTH - CHART_PADDING * 2;
  const usableHeight = CHART_HEIGHT - CHART_PADDING * 2;

  const positions = data.map((item, index) => {
    const x =
      data.length === 1
        ? CHART_WIDTH / 2
        : CHART_PADDING + (index / (data.length - 1)) * usableWidth;
    const y =
      CHART_HEIGHT -
      CHART_PADDING -
      ((item.cumulative_points - minValue) / range) * usableHeight;

    return { ...item, x, y };
  });

  return {
    positions,
    polylinePoints: positions
      .map((point) => `${point.x},${point.y}`)
      .join(" "),
  };
};

const ProgressChart = ({ data, timeframe }) => {
  const [activeKey, setActiveKey] = useState(null);

  if (!data.length) {
    return (
      <div className="progress-chart-empty">
        No food logs yet. Add a meal to start tracking your points over time.
      </div>
    );
  }

  const { positions, polylinePoints } = buildChartGeometry(data);
  const activePositionIndex = positions.findIndex(
    (point) => point.label === activeKey,
  );
  const safeIndex =
    activePositionIndex >= 0 ? activePositionIndex : positions.length - 1;
  const activePoint = positions[safeIndex] || positions[positions.length - 1];

  return (
    <div className="progress-chart-shell">
      <div className="progress-chart-summary">
        <div>
          <span className="chart-summary-label">Selected Period</span>
          <strong>{activePoint.label}</strong>
        </div>
        <div>
          <span className="chart-summary-label">Points Added</span>
          <strong>
            {activePoint.points >= 0
              ? `+${activePoint.points}`
              : activePoint.points}
          </strong>
        </div>
        <div>
          <span className="chart-summary-label">Running Total</span>
          <strong>{activePoint.cumulative_points}</strong>
        </div>
      </div>

      <svg
        className="progress-chart"
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        role="img"
        aria-label={`${timeframe} points progress chart`}
      >
        <line
          x1={CHART_PADDING}
          y1={CHART_HEIGHT - CHART_PADDING}
          x2={CHART_WIDTH - CHART_PADDING}
          y2={CHART_HEIGHT - CHART_PADDING}
          className="chart-axis"
        />
        <line
          x1={CHART_PADDING}
          y1={CHART_PADDING}
          x2={CHART_PADDING}
          y2={CHART_HEIGHT - CHART_PADDING}
          className="chart-axis"
        />
        <polyline
          fill="none"
          points={polylinePoints}
          className="chart-line"
        />
        {positions.map((point, index) => (
          <g
            key={point.label}
            className="chart-point-group"
            onMouseEnter={() => setActiveKey(point.label)}
            onFocus={() => setActiveKey(point.label)}
          >
            <line
              x1={point.x}
              y1={CHART_HEIGHT - CHART_PADDING}
              x2={point.x}
              y2={point.y}
              className="chart-guide"
            />
            <circle
              cx={point.x}
              cy={point.y}
              r={index === safeIndex ? 7 : 5}
              className={index === safeIndex ? "chart-point active" : "chart-point"}
              tabIndex="0"
            />
          </g>
        ))}
      </svg>

      <div className="progress-chart-labels">
        {positions.map((point, index) => (
          <button
            key={point.label}
            type="button"
            className={index === safeIndex ? "chart-label active" : "chart-label"}
            onClick={() => setActiveKey(point.label)}
          >
            {point.label}
          </button>
        ))}
      </div>
    </div>
  );
};

const Profile = () => {
  const chartRef = useRef(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState("daily");
  const [activityPage, setActivityPage] = useState(0);
  const [formData, setFormData] = useState({
    display_name: "",
    phone: "",
    dietary_preferences: "",
  });
  const userId = localStorage.getItem("userId");

  const fetchUserData = useCallback(() => {
    userService
      .getProfile(userId)
      .then((data) => {
        setUser(data);
        setActivityPage(0);
        setFormData({
          display_name: data.display_name || "",
          phone: data.phone || "",
          dietary_preferences: data.dietary_preferences || "",
        });
      })
      .catch((err) => setError(err.message));
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId, fetchUserData]);

  useEffect(() => {
    const handleFoodLogSaved = (event) => {
      if (String(event.detail?.userId) === String(userId)) {
        fetchUserData();
      }
    };

    window.addEventListener("biteful:food-log-saved", handleFoodLogSaved);

    return () => {
      window.removeEventListener("biteful:food-log-saved", handleFoodLogSaved);
    };
  }, [fetchUserData, userId]);

  const handleSave = () => {
    userService
      .updateProfile(userId, formData)
      .then(() => {
        setIsEditing(false);
        fetchUserData();
      })
      .catch((err) => alert("Update failed: " + err.message));
  };

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        "Are you sure? This will delete all your food logs and profile data permanently.",
      )
    ) {
      userService
        .deleteProfile(userId)
        .then(() => {
          localStorage.clear();
          window.location.href = "/login";
        })
        .catch((err) => alert("Delete failed: " + err.message));
    }
  };

  const handleDownloadChart = useCallback(() => {
    const svgElement = chartRef.current?.querySelector("svg");

    if (!svgElement) {
      return;
    }

    const svgClone = svgElement.cloneNode(true);
    svgClone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svgClone.setAttribute("width", String(CHART_WIDTH));
    svgClone.setAttribute("height", String(CHART_HEIGHT));

    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
    style.textContent = CHART_EXPORT_STYLES;
    defs.appendChild(style);
    svgClone.insertBefore(defs, svgClone.firstChild);

    const serializer = new XMLSerializer();
    const svgMarkup = serializer.serializeToString(svgClone);
    const svgBlob = new Blob([svgMarkup], {
      type: "image/svg+xml;charset=utf-8",
    });
    const svgUrl = URL.createObjectURL(svgBlob);
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = 2;
      canvas.width = CHART_WIDTH * scale;
      canvas.height = CHART_HEIGHT * scale;

      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(svgUrl);
        return;
      }

      context.scale(scale, scale);
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, CHART_WIDTH, CHART_HEIGHT);
      context.drawImage(image, 0, 0, CHART_WIDTH, CHART_HEIGHT);

      const downloadLink = document.createElement("a");
      downloadLink.href = canvas.toDataURL("image/png");
      downloadLink.download = `biteful-progress-${selectedTimeframe}.png`;
      downloadLink.click();

      URL.revokeObjectURL(svgUrl);
    };

    image.src = svgUrl;
  }, [selectedTimeframe]);

  if (!userId || userId === "undefined") {
    // nav("/login", { state: { error: "Please log in to view your profile." } });
  }

  if (error) return <div className="error-msg">{error}</div>;
  if (!user) return <div className="loading">Loading Biteful Dashboard...</div>;

  const getPigeonMessage = () => {
    if (user.health_score < -50) return fatPigeon;
    if (user.health_score > 100) return superHealthyPigeon;
    return healthyPigeon;
  };

  const selectedProgress = user.progress?.[selectedTimeframe] || [];
  const activityLogs = user.food_logs || [];
  const activityPageCount = Math.max(
    1,
    Math.ceil(activityLogs.length / RECENT_ACTIVITY_PAGE_SIZE),
  );
  const safeActivityPage = Math.min(activityPage, activityPageCount - 1);
  const visibleActivityLogs = activityLogs.slice(
    safeActivityPage * RECENT_ACTIVITY_PAGE_SIZE,
    safeActivityPage * RECENT_ACTIVITY_PAGE_SIZE + RECENT_ACTIVITY_PAGE_SIZE,
  );

  return (
    <div className="profile-container">
      <div className="profile-top-grid">
        <header className="identity-card">
          <h1>
            {user.display_name?.toUpperCase() || user.username.toUpperCase()}
          </h1>
          <p className="email-subtext">{user.email}</p>
        </header>
        <div className="pigeon-card">
          <img
            src={getPigeonMessage()}
            alt="Pigeon Status"
            className="pigeon-image"
          />
        </div>
      </div>

      <div className="profile-main-grid">
        <div className="profile-content-row profile-content-row-top">
          <section className="personal-info-card">
            <div className="card-header">
              <h2 style={{ margin: 0, color: "#333", fontSize: "1.2rem" }}>
                PERSONAL INFO
              </h2>
              <div className="header-actions">
                {!isEditing ? (
                  <button
                    className="edit-icon"
                    onClick={() => setIsEditing(true)}
                  >
                    ✎
                  </button>
                ) : (
                  <div className="edit-actions">
                    <button className="save-btn" onClick={handleSave}>
                      Save
                    </button>
                    <button
                      className="cancel-btn"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="info-grid">
              <div className="info-item">
                <label>FULL NAME</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.display_name}
                    onChange={(e) =>
                      setFormData({ ...formData, display_name: e.target.value })
                    }
                  />
                ) : (
                  <p>{user.display_name || "Not Set"}</p>
                )}
              </div>

              <div className="info-item">
                <label>EMAIL</label>
                <p>{user.email}</p>
              </div>

              <div className="info-item">
                <label>PHONE</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                ) : (
                  <p>{user.phone || "(---) --- ----"}</p>
                )}
              </div>
            </div>

            {isEditing && (
              <button
                className="delete-account-btn"
                onClick={handleDeleteAccount}
              >
                DELETE ACCOUNT PERMANENTLY
              </button>
            )}
          </section>

          <section className="stats-card">
            <h2>POINTS & STATS</h2>
            <div className="total-points-box">
              <span className="big-number">{user.health_score || 0}</span>
              <p>Current Points</p>
            </div>
            <div className="stat-row healthy">
              <span className="stat-label">healthy</span>
              <span className="stat-value">{user.stats?.healthy || 0}</span>
            </div>
            <div className="stat-row unhealthy">
              <span className="stat-label">unhealthy</span>
              <span className="stat-value">{user.stats?.unhealthy || 0}</span>
            </div>
          </section>
        </div>

        <div className="profile-content-row profile-content-row-bottom">
          <section className="progress-card">
            <div className="progress-card-header">
              <div>
                <h2>PROGRESS VISUALIZATION</h2>
                <p className="progress-card-subtitle">
                  Track your Biteful point accumulation over time.
                </p>
              </div>
              <div className="progress-controls">
                <div
                  className="timeframe-toggle"
                  role="tablist"
                  aria-label="Progress timeframe"
                >
                  {TIMEFRAME_OPTIONS.map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      className={
                        selectedTimeframe === option.key
                          ? "timeframe-btn active"
                          : "timeframe-btn"
                      }
                      onClick={() => setSelectedTimeframe(option.key)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="download-chart-btn"
                  onClick={handleDownloadChart}
                  disabled={!selectedProgress.length}
                >
                  Save as PNG
                </button>
              </div>
            </div>

            <div ref={chartRef}>
              <ProgressChart
                data={selectedProgress}
                timeframe={selectedTimeframe}
              />
            </div>
          </section>

          <section className="recent-activity-card">
            <div className="recent-activity-header">
              <h2>RECENT ACTIVITY</h2>
              <div className="activity-pager">
                <button
                  type="button"
                  className="activity-pager-btn"
                  onClick={() => setActivityPage((current) => Math.max(current - 1, 0))}
                  disabled={safeActivityPage === 0}
                  aria-label="Previous activity page"
                >
                  ←
                </button>
                <span className="activity-pager-label">
                  {safeActivityPage + 1} / {activityPageCount}
                </span>
                <button
                  type="button"
                  className="activity-pager-btn"
                  onClick={() =>
                    setActivityPage((current) =>
                      Math.min(current + 1, activityPageCount - 1),
                    )
                  }
                  disabled={safeActivityPage >= activityPageCount - 1}
                  aria-label="Next activity page"
                >
                  →
                </button>
              </div>
            </div>
            <div className="activity-list">
              {visibleActivityLogs.map((log, index) => (
                <div key={index} className="activity-row">
                  <div
                    className={`icon-circle ${log.health_points >= 0 ? "pos" : "neg"}`}
                  >
                    {log.health_points >= 0 ? "✓" : "!"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0 }}>
                      <strong>{log.item_name}</strong>
                    </p>
                    <small style={{ color: "#888" }}>
                      {new Date(log.logged_at).toLocaleDateString()}
                    </small>
                  </div>
                  <div
                    className={`activity-points ${log.health_points >= 0 ? "text-green" : "text-red"}`}
                  >
                    {log.health_points >= 0
                      ? `+${log.health_points}`
                      : log.health_points}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Profile;
