# ──────────────────────────────────────────────────────────────────────────────
# Sales Forecasting — Linear Regression Model
# Predicts next 4 quarters of revenue based on historical quarterly trends
# ──────────────────────────────────────────────────────────────────────────────

# Load quarterly sales data produced by the Python ETL pipeline
base_dir <- normalizePath(file.path(dirname(sys.frame(1)$ofile), ".."))
data_path <- file.path(base_dir, "data", "quarterly_sales.csv")
output_path <- file.path(base_dir, "data", "forecast_results.csv")

cat("▸ Loading quarterly sales data...\n")
quarterly <- read.csv(data_path, stringsAsFactors = FALSE)

# Create numeric time index for regression
quarterly$time_index <- seq_len(nrow(quarterly))

cat(sprintf("  ✓ %d quarters loaded (%s to %s)\n",
            nrow(quarterly), quarterly$Year_Quarter[1],
            quarterly$Year_Quarter[nrow(quarterly)]))

# ── Fit linear regression model ──────────────────────────────────────────────
cat("▸ Fitting linear regression model...\n")
model <- lm(revenue ~ time_index, data = quarterly)

cat("  Model Summary:\n")
cat(sprintf("    R²:        %.4f\n", summary(model)$r.squared))
cat(sprintf("    Intercept: %.2f\n", coef(model)[1]))
cat(sprintf("    Slope:     %.2f per quarter\n", coef(model)[2]))

# ── Generate predictions for existing quarters ────────────────────────────────
quarterly$predicted <- predict(model, quarterly)
quarterly$residual <- quarterly$revenue - quarterly$predicted

# ── Forecast next 4 quarters ─────────────────────────────────────────────────
cat("▸ Forecasting next 4 quarters...\n")

last_index <- max(quarterly$time_index)
last_year <- as.integer(sub("-Q.*", "", quarterly$Year_Quarter[nrow(quarterly)]))
last_qtr <- as.integer(sub(".*-Q", "", quarterly$Year_Quarter[nrow(quarterly)]))

future_indices <- (last_index + 1):(last_index + 4)
future_labels <- character(4)
for (i in 1:4) {
  q <- (last_qtr + i - 1) %% 4 + 1
  y <- last_year + ((last_qtr + i - 1) %/% 4)
  future_labels[i] <- sprintf("%d-Q%d", y, q)
}

future_df <- data.frame(
  Year_Quarter = future_labels,
  time_index = future_indices
)

# Predict with confidence intervals
pred <- predict(model, future_df, interval = "confidence", level = 0.95)
future_df$revenue <- NA
future_df$predicted <- pred[, "fit"]
future_df$lower_ci <- pred[, "lwr"]
future_df$upper_ci <- pred[, "upr"]
future_df$residual <- NA
future_df$is_forecast <- TRUE

# Mark historical data
quarterly$lower_ci <- NA
quarterly$upper_ci <- NA
quarterly$is_forecast <- FALSE

# Combine historical + forecast
result <- rbind(
  quarterly[, c("Year_Quarter", "time_index", "revenue", "predicted",
                "lower_ci", "upper_ci", "residual", "is_forecast")],
  future_df[, c("Year_Quarter", "time_index", "revenue", "predicted",
                "lower_ci", "upper_ci", "residual", "is_forecast")]
)

# ── Save results ──────────────────────────────────────────────────────────────
write.csv(result, output_path, row.names = FALSE)

cat(sprintf("\n✅ Forecast complete → %s\n", output_path))
cat("   Forecasted quarters:\n")
for (i in 1:4) {
  cat(sprintf("     %s: $%s (95%% CI: $%s – $%s)\n",
              future_df$Year_Quarter[i],
              formatC(future_df$predicted[i], format = "f", digits = 0, big.mark = ","),
              formatC(future_df$lower_ci[i], format = "f", digits = 0, big.mark = ","),
              formatC(future_df$upper_ci[i], format = "f", digits = 0, big.mark = ",")))
}
