import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
} from "@mui/material";
import { useUsersPerPds } from "../api/pds";
import { AccountShortEntry } from "../common-components/account-short-entry";
import { HydrateFallback } from "../common-components/hydrate-fallback";
import { useFeatureFlag } from "../api/featureFlags";

export default function UsersPerPdsPage() {
  const navigate = useNavigate()
  const { pds: encodedPds } = useParams();
  const pds = encodedPds ? decodeURIComponent(encodedPds) : "";
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const pdsInformation = useFeatureFlag('pds-information');

  const [page, setPage] = useState(1);
  const [allUsers, setAllUsers] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const containerRef = useRef(null);

  const { data, status, isFetching } = useUsersPerPds(pds, page);

  // Infinite scroll
  const handleScroll = () => {
    if (!containerRef.current || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 50 && !isFetching) {
      setPage((prev) => prev + 1);
    }
  };

  // Append newly loaded page and check if we should stop
  useEffect(() => {
    if (isFetching || !pdsInformation) return;

    if (data?.data?.length) {
      setAllUsers((prev) => [...prev, ...data.data]);
      if (data.data.length < 100) {
        setHasMore(false); // stop loading more if less than 100 items
      }
    } else {
      setHasMore(false); // stop if empty array
    }
  }, [data, isFetching, pdsInformation]);


  useEffect(() => {
    if (!pdsInformation) {
      navigate("/");
    }
  }, [pdsInformation, navigate]);

  if (!pdsInformation) {
    return <HydrateFallback />;
  }

  if (status === "pending" && page === 1) {
    return (
      <HydrateFallback />
    );
  }

  if (status === "error" || data?.error) {
    return (
      <Container sx={{ p: 4, textAlign: "center" }}>
        <Typography color="error">{data?.error || "Failed to load users"}</Typography>
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
      <Box sx={{ width: "100%", maxWidth: 600 }}>
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
          <IconButton onClick={() => navigate(-1)}>
            &lsaquo;
          </IconButton>
          <Typography sx={{ fontSize: "0.8em", color: "silver", mb: isMobile ? 1 : 0 }}>
            <i>Users for PDS: {pds}</i>
          </Typography>
        </Box>

        {/* Table */}
        <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow sx={{ fontSize: "1.2em", backgroundColor: "#ffe492" }}>
                <TableCell sx={{ fontWeight: "bold", p: isMobile ? 0.5 : 1, wordBreak: "break-word" }}>
                  Handle
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", p: isMobile ? 0.5 : 1, wordBreak: "break-word" }}>
                  DID
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} sx={{ textAlign: "center", py: 2 }}>
                    No results found
                  </TableCell>
                </TableRow>
              ) : (
                allUsers.map((user) => (
                  <TableRow
                    key={user.did}
                    hover
                  >
                    <TableCell sx={{ p: isMobile ? 0.5 : 1, wordBreak: "break-word" }}>

                      <AccountShortEntry account={user.did} />

                    </TableCell>
                    <TableCell
                      sx={{
                        p: isMobile ? 0.5 : 1,
                        wordBreak: "break-word",
                        fontSize: isMobile ? "0.8em" : "1em",
                      }}
                    >
                      {user.did ?? "-"}
                    </TableCell>

                  </TableRow>
                ))
              )}
              {isFetching && hasMore && (
                <TableRow>
                  <TableCell colSpan={2} sx={{ textAlign: "center", py: 2 }}>
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
