import React, { useCallback, useContext } from "react";
import { Formik, Form } from "formik";
import { Snackbar } from "@rmwc/snackbar";

import { gql } from "apollo-boost";
import { useMutation } from "@apollo/react-hooks";
import { formatError } from "../util/error";
import { GET_PENDING_CHANGES } from "./PendingChanges";
import { TextField } from "../Components/TextField";
import { Button, EnumButtonStyle } from "../Components/Button";
import PendingChangesContext from "../VersionControl/PendingChangesContext";
import { validate } from "../util/formikValidateJsonSchema";

type CommitType = {
  message: string;
};
const INITIAL_VALUES: CommitType = {
  message: "",
};

type Props = {
  applicationId: string;
  onComplete: () => void;
};

const FORM_SCHEMA = {
  required: ["message"],
  properties: {
    message: {
      type: "string",
      minLength: 1,
    },
  },
};

const Commit = ({ applicationId, onComplete }: Props) => {
  const pendingChangesContext = useContext(PendingChangesContext);

  const [commit, { error, loading }] = useMutation(COMMIT_CHANGES, {
    onCompleted: (data) => {
      pendingChangesContext.reset();
      onComplete();
    },
    refetchQueries: [
      {
        query: GET_PENDING_CHANGES,
        variables: {
          applicationId: applicationId,
        },
      },
    ],
  });

  const handleSubmit = useCallback(
    (data: CommitType) => {
      commit({
        variables: {
          message: data.message,
          appId: applicationId,
        },
      }).catch(console.error);
    },
    [applicationId, commit]
  );

  const errorMessage = formatError(error);

  return (
    <>
      <Formik
        initialValues={INITIAL_VALUES}
        validate={(values: CommitType) => validate(values, FORM_SCHEMA)}
        onSubmit={handleSubmit}
      >
        <Form>
          <TextField
            rows={3}
            textarea
            name="message"
            label="Type in a commit message"
            disabled={loading}
            autoFocus
            hideLabel
            placeholder="Type in a commit message"
            autoComplete="off"
          />
          <Button
            buttonStyle={EnumButtonStyle.Primary}
            eventData={{
              eventName: "commit",
            }}
          >
            Commit
          </Button>
        </Form>
      </Formik>
      <Snackbar open={Boolean(error)} message={errorMessage} />
    </>
  );
};

export default Commit;

const COMMIT_CHANGES = gql`
  mutation commit($message: String!, $appId: String!) {
    commit(data: { message: $message, app: { connect: { id: $appId } } }) {
      id
    }
  }
`;
