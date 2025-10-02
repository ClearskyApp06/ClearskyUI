import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import { useLabelerRecord } from "../api/labled";
import { AccountShortEntry } from "../common-components/account-short-entry";
import { useFeatureFlag } from "../api/featureFlags";

export default function LabelView() {
  const { did } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const labelerInformationFlag = useFeatureFlag('labeler-information');

  const { data, status } = useLabelerRecord(did);

  const allDefinitions = data?.value.policies.labelValueDefinitions;

  useEffect(() => {
    if (!labelerInformationFlag) {
      navigate("/");
    }
  }, [labelerInformationFlag, navigate]);

  if (!labelerInformationFlag || status === "pending") {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (status === "error") {
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
        <Box sx={{ width: "100%", maxWidth: 1200 }}>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              mb: 2,
              flexWrap: "wrap",
            }}
          >
            <IconButton onClick={() => navigate(-1)}>&lsaquo;</IconButton>

          </Box>
          <Typography color="error" textAlign={'center'}>
            Labeler not active
          </Typography>
        </Box>
      </Box>

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
          {
            did &&
            <AccountShortEntry account={did} />
          }

          <Typography
            sx={{
              fontSize: "0.8em",
              color: "silver",
              mb: isMobile ? 1 : 0,
            }}
          >
            <i>Labels for {did}</i>
          </Typography>
        </Box>

        {/* Mobile: Card View */}
        {isMobile ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {!allDefinitions || allDefinitions.length === 0 ? (
              <Typography textAlign="center">No label definitions found</Typography>
            ) : (
              allDefinitions.map((def) => {
                const locale =
                  def.locales?.find(({ lang }) => lang === "en") || def.locales?.[0];
                return (
                  <Card key={def.identifier} variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="textSecondary">
                        Name (id)
                      </Typography>
                      <Typography>
                        {locale?.name || "-"} ({def.identifier})
                      </Typography>

                      <Divider sx={{ my: 1 }} />

                      <Typography variant="subtitle2" color="textSecondary">
                        Description
                      </Typography>
                      <Typography sx={{ fontSize: "0.9em" }}>
                        {locale?.description || "-"}
                      </Typography>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </Box>
        ) : (
          /* Desktop: Table View */
          <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: "auto" }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", whiteSpace: "nowrap" }}>
                    Name (id)
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!allDefinitions || allDefinitions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} sx={{ textAlign: "center", py: 2 }}>
                      No label definitions found
                    </TableCell>
                  </TableRow>
                ) : (
                  allDefinitions.map((def) => {
                    const locale =
                      def.locales?.find(({ lang }) => lang === "en") || def.locales?.[0];
                    return (
                      <TableRow key={def.identifier}>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          {locale?.name || "-"} ({def.identifier})
                        </TableCell>
                        <TableCell>{locale?.description || "-"}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Box>
  );
}
