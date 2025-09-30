// src/pages/DidsPerPdsPage.tsx
import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Link,
  useTheme,
  useMediaQuery,
  TextField,
  Autocomplete,
} from "@mui/material";
import { useDidsPerPds } from "../api/pds";
import { useNavigate } from "react-router-dom";
import { HydrateFallback } from "../common-components/hydrate-fallback";
import { useFeatureFlag } from "../api/featureFlags";

export default function DidsPerPdsPage() {
  const navigate = useNavigate()
  const { data, status } = useDidsPerPds();
  const [searchText, setSearchText] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const pdsInformation = useFeatureFlag('pds-information');

  // Filtered data based on search
  const filteredData = useMemo(() => {
    if (!data?.data) return [];
    return data.data.filter((item) =>
      item.pds.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [data, searchText]);

  useEffect(() => {
    if (!pdsInformation) {
      navigate("/");
    }
  }, [pdsInformation, navigate]);

  if (!pdsInformation) {
    return <HydrateFallback />;
  }

  if (status === "pending") {
    return (
      <HydrateFallback />
    );
  }

  if (status === "error" || data?.error) {
    return (
      <Container sx={{ p: 4, textAlign: "center" }}>
        <Typography color="error">{data?.error || "Failed to load data"}</Typography>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        height: "100vh",
        overflow: "auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        py: 4,
        px: 2,
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 600 }}>
        {/* As-of subtitle and toggle button */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
            flexWrap: "wrap",
          }}
        >
          <Typography sx={{ fontSize: "0.8em", color: "silver", mb: isMobile ? 1 : 0 }}>
            <i>As of: {data?.["as of"]}</i>
          </Typography>
        </Box>

        {/* Search bar using Autocomplete style */}
        <Autocomplete
          freeSolo
          options={data?.data.map((d) => d.pds) || []}
          inputValue={searchText}
          onInputChange={(event, newInputValue) => setSearchText(newInputValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search PDS"
              placeholder="Enter PDS URL"
              variant="standard"
              size={isMobile ? "small" : "medium"}
              fullWidth
              sx={{ mb: 2 }}
            />
          )}
        />

        {/* Table */}
        <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow sx={{ fontSize: "1.2em", backgroundColor: "#ffe492" }}>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    p: isMobile ? 0.5 : 1,
                    wordBreak: "break-word",
                  }}
                >
                  PDS
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    textAlign: "right",
                    p: isMobile ? 0.5 : 1,
                  }}
                >
                  DID Count
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} sx={{ textAlign: "center", py: 2 }}>
                    No results found
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item) => (
                  <TableRow
                    key={item.pds}
                    hover
                    sx={{ cursor: "pointer" }}
                    onClick={() => navigate(`/pds/${encodeURIComponent(item.pds)}`)}
                  >
                    <TableCell
                      sx={{
                        p: isMobile ? 0.5 : 1,
                        wordBreak: "break-word",
                      }}
                    >
                      <Link
                        href={`/pds/${encodeURIComponent(item.pds)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          color: "primary.main",
                          "&:hover": { textDecoration: "underline" },
                          fontSize: isMobile ? "0.8em" : "1em",
                        }}
                        onClick={(e) => e.preventDefault()} // Prevent default so row click works
                      >
                        {item.pds}
                      </Link>
                    </TableCell>
                    <TableCell
                      sx={{
                        textAlign: "right",
                        p: isMobile ? 0.5 : 1,
                        fontSize: isMobile ? "0.8em" : "1em",
                      }}
                    >
                      {item.did_count.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>

          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}
