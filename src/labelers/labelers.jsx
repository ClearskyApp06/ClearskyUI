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
  Typography,
  CircularProgress,
  useTheme,
  useMediaQuery,
  IconButton,
  Button,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import { useLabelersPage } from "../api/labled";
import { AccountShortEntry } from "../common-components/account-short-entry";
import { HydrateFallback } from "../common-components/hydrate-fallback";
import { useFeatureFlag } from "../api/featureFlags";

export default function LabelersPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const labelerInformationFlag = useFeatureFlag('labeler-information');


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
    if (isFetching || !labelerInformationFlag) return;

    if (data?.data?.length) {
      setAllLabelers((prev) => [...prev, ...data.data]);
      if (data.data.length < 100) {
        setHasMore(false);
      }
    } else {
      setHasMore(false);
    }
  }, [data, isFetching, labelerInformationFlag]);

  useEffect(() => {
    if (!labelerInformationFlag) {
      navigate("/");
    }
  }, [labelerInformationFlag, navigate]);

  if (!labelerInformationFlag || (status === "pending" && page === 1)) {
    return <HydrateFallback />;
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
        overflow: 'auto',
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

        {/* Mobile: Card View */}
        {isMobile ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {allLabelers.length === 0 ? (
              <Typography textAlign="center">No results found</Typography>
            ) : (
              allLabelers.map((labeler) => (
                <Card key={labeler.did} variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="textSecondary">
                      Handle
                    </Typography>
                    <AccountShortEntry account={labeler.did} />

                    <Divider sx={{ my: 1 }} />

                    <Typography variant="subtitle2" color="textSecondary">
                      DID
                    </Typography>
                    <Typography>{labeler.did ?? "-"}</Typography>

                    <Divider sx={{ my: 1 }} />

                    <Typography variant="subtitle2" color="textSecondary">
                      Name
                    </Typography>
                    <Typography>{labeler.name?.trim() || "-"}</Typography>

                    <Divider sx={{ my: 1 }} />

                    <Typography variant="subtitle2" color="textSecondary">
                      Endpoint
                    </Typography>
                    {labeler.endpoint ? (
                      <a
                        href={labeler.endpoint}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {labeler.endpoint}
                      </a>
                    ) : (
                      "-"
                    )}

                    <Divider sx={{ my: 1 }} />

                    <Typography variant="subtitle2" color="textSecondary">
                      Description
                    </Typography>
                    <Typography sx={{ fontSize: "0.9em" }}>
                      {labeler.description ?? "-"}
                    </Typography>

                    <Box mt={2} textAlign="center">
                      <Button
                        sx={{ textTransform: "none" }}
                        variant="contained"
                        onClick={() => navigate(`/labelers/${labeler.did}`)}
                      >
                        See Labels
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))
            )}
            {isFetching && hasMore && (
              <Box sx={{ textAlign: "center", py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            )}
          </Box>
        ) : (
          /* Desktop: Table View */
          <TableContainer
            sx={{
              width: "100%",
              overflow: 'auto',
              borderRadius: 2,
            }}
          >
            <Table size="small" stickyHeader sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow>
                  {[
                    "Handle",
                    "DID",
                    "Name",
                    "Endpoint",
                    "Description",
                    "Actions",
                  ].map((head) => (
                    <TableCell key={head} sx={{
                      fontWeight: "bold",
                      wordBreak: "break-word",
                      whiteSpace: "normal",
                    }}>
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
                      <TableCell sx={{
                        wordBreak: "break-word",
                        whiteSpace: "normal",
                        maxWidth: 300
                      }}>
                        <AccountShortEntry account={labeler.did} />
                      </TableCell>
                      <TableCell sx={{
                        wordBreak: "break-word",
                        whiteSpace: "normal",
                      }}>{labeler.did ?? "-"}</TableCell>
                      <TableCell sx={{
                        wordBreak: "break-word",
                        whiteSpace: "normal",
                      }}>{labeler.name?.trim() || "-"}</TableCell>
                      <TableCell sx={{
                        color: "primary.main", wordBreak: "break-word",
                        whiteSpace: "normal",
                      }}>
                        {labeler.endpoint ? (
                          <a
                            href={labeler.endpoint}
                            target="_blank"
                            rel="noopener noreferrer"

                          >
                            {labeler.endpoint}
                          </a>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell sx={{
                        wordBreak: "break-word",
                        whiteSpace: "normal",
                        maxWidth: 350
                      }}>{labeler.description ?? "-"}</TableCell>
                      <TableCell sx={{ textAlign: "center" }}>
                        <Button
                          sx={{ textTransform: "none", whiteSpace: "nowrap" }}
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
        )}
      </Box>
    </Box>
  );
}
