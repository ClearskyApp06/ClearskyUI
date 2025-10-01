import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
  CircularProgress,
  useTheme,
  useMediaQuery,
  IconButton,
  Button,
} from "@mui/material";
import { useLabelersPage } from "../api/labled";
import { AccountShortEntry } from "../common-components/account-short-entry";

export default function LabelersPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const labelerInformation = true;

  const [page, setPage] = useState(1);
  const [allLabelers, setAllLabelers] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const containerRef = useRef(null);

  const { data, status, isFetching } = useLabelersPage(page);

  // Infinite scroll
  const handleScroll = () => {
    if (!containerRef.current || !hasMore) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 50 && !isFetching) {
      setPage((prev) => prev + 1);
    }
  };

  // Append pages & stop if needed
  useEffect(() => {
    if (isFetching || !labelerInformation) return;

    if (data?.data?.length) {
      setAllLabelers((prev) => [...prev, ...data.data]);
      if (data.data.length < 100) {
        setHasMore(false);
      }
    } else {
      setHasMore(false);
    }
  }, [data, isFetching, labelerInformation]);

  useEffect(() => {
    if (!labelerInformation) {
      navigate("/");
    }
  }, [labelerInformation, navigate]);

  if (!labelerInformation || (status === "pending" && page === 1)) {
    return <>Loading...</>;
  }

  if (status === "error" || data?.error) {
    return (
      <Container sx={{ p: 4, textAlign: "center" }}>
        <Typography color="error">
          {data?.error || "Failed to load labelers"}
        </Typography>
      </Container>
    );
  }

  return (
    <Box
      ref={containerRef}
      onScroll={handleScroll}
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
      <Box sx={{ width: "100%", maxWidth: 1200 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
            flexWrap: "wrap",
          }}
        >
          <IconButton onClick={() => navigate(-1)}>&lsaquo;</IconButton>
          <Typography
            sx={{
              fontSize: "0.8em",
              color: "silver",
              mb: isMobile ? 1 : 0,
            }}
          >
            <i>Labeler Information</i>
          </Typography>
        </Box>

        {/* Table */}
        <TableContainer
          component={Paper}
          sx={{
            width: "100%",
            overflowX: "auto", // horizontal scroll on small screens
            borderRadius: 2,
          }}
        >
          <Table size="small" stickyHeader sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#ffe492" }}>
                {["Handle", "DID", "Name", "Endpoint", "Description", "Actions"].map((head) => (
                  <TableCell
                    key={head}
                    sx={{
                      fontWeight: "bold",
                      p: isMobile ? 0.5 : 1,
                      fontSize: isMobile ? "0.75em" : "1em",
                      wordBreak: "break-word",
                      whiteSpace: "normal",
                    }}
                  >
                    {head}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {allLabelers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: "center", py: 2 }}>
                    No results found
                  </TableCell>
                </TableRow>
              ) : (
                allLabelers.map((labeler) => (
                  <TableRow key={labeler.did} hover>
                    <TableCell sx={{ p: isMobile ? 0.5 : 1, wordBreak: "break-word" }}>
                      <AccountShortEntry account={labeler.did} />
                    </TableCell>
                    <TableCell sx={{ p: isMobile ? 0.5 : 1, wordBreak: "break-word" }}>
                      {labeler.did ?? "-"}
                    </TableCell>
                    <TableCell sx={{ p: isMobile ? 0.5 : 1, wordBreak: "break-word" }}>
                      {labeler.name?.trim() || "-"}
                    </TableCell>
                    <TableCell sx={{ p: isMobile ? 0.5 : 1, wordBreak: "break-word", color: "primary.main" }}>
                      {labeler.endpoint ? (
                        <a
                          href={labeler.endpoint}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "inherit", textDecoration: "none" }}
                        >
                          {labeler.endpoint}
                        </a>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell sx={{ p: isMobile ? 0.5 : 1, wordBreak: "break-word", fontSize: isMobile ? "0.75em" : "1em", maxWidth: 800 }}>
                      {labeler.description ?? "-"}
                    </TableCell>
                    <TableCell sx={{ p: isMobile ? 0.5 : 1, textAlign: "center" }}>
                      <Button
                        sx={{ textTransform: "none", whiteSpace: 'nowrap' }}
                        variant="contained"
                        onClick={() => navigate(`/labelers/${labeler.did}`)}
                      >
                        See Labels
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
              {isFetching && hasMore && (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: "center", py: 2 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>


      </Box>
    </Box>
  );
}
